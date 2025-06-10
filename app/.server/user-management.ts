import { createRandomBytes, SafeComparePasswords, scryptHash } from "./auth";
import { prisma } from "./prisma";
import type { AuthCookie, LoginFormErrors, SignUpFormErrors } from "./types";
import validator from "validator";

/**
 * Default session expiry date - 30 days
 */
export const DEFAULT_SESSION_EXPIRY_DATE = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
);
export const GENERAL_LOGIN_ERROR_STATEMENT = "Incorrect user details";

/**
 * Create a new user
 * @returns The user and form errors. If there is an error, the user will be null and the form errors will have the error message
 */
export async function createNewUser({
  username,
  email,
  displayName,
  password,
  confirmPassword,
  ipAddress,
  userAgent,
}: {
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const GENERAL_STATEMENT =
    "Error creating user, Contact support if this persists";
  const { vUsername, vEmail, formErrors } = validate_signup_form({
    username,
    password,
    email,
    confirmPassword,
  });
  if (formErrors.hasErrors) {
    console.log("Sign up validation error", formErrors);
    return { user: null, formErrors };
  }
  let userExists;
  username = vUsername.trim().toLowerCase();
  email = vEmail.trim().toLowerCase();
  try {
    userExists = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            username: username,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error finding user:", error);
    formErrors.general = GENERAL_STATEMENT;
    formErrors.hasErrors = true;
    return { user: null, formErrors };
  }

  if (userExists) {
    if (userExists.email == email) {
      formErrors.email = "Email already exists";
      formErrors.hasErrors = true;
    }
    if (userExists.username == username) {
      formErrors.username = "Username already exists";
      formErrors.hasErrors = true;
    }
    return { user: null, formErrors };
  }

  // if user does not exist, create user

  const sessionId = createRandomBytes({ format: "base64url", length: 16 });
  // const emailVerificationToken = createRandom16Bytes();
  const { passwordHash, salt, error } = scryptHash({ password });

  if (error) {
    formErrors.general = "Server Error - Contact support if this presists";
    formErrors.hasErrors = true;
    return { user: null, formErrors };
  }
  let user;

  try {
    user = await prisma.user.upsert({
      where: {
        email,
        username,
      },
      update: {},
      create: {
        displayName: displayName,
        username: username,
        email: email,
        passwordHash: passwordHash,
        salt: salt,
        sessions: {
          create: {
            sessionId,
            userAgent,
            ipAddress,
            expiresAt: DEFAULT_SESSION_EXPIRY_DATE,
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        sessions: {
          select: {
            sessionId: true,
            expiresAt: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    formErrors.general = GENERAL_STATEMENT;
    formErrors.hasErrors = true;
    return { user: null, formErrors };
  }
  // const emailMe = await sendSignupConfirmation(user.email);
  // if (emailMe.error) {
  //   console.error("Error sending signup confirmation email:", emailMe.error);
  // }
  // console.log(`User created and email sent to ${user.email}`);
  return { user, formErrors };
}

export function validate_signup_form({
  username,
  password,
  confirmPassword,
  email,
}: {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}) {
  const formErrors: SignUpFormErrors = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
    hasErrors: false,
  };

  const { username: vUsername, error: usernameError } =
    validateUsername(username);
  if (usernameError) {
    formErrors.username = usernameError;
    formErrors.hasErrors = true;
  }
  const { email: vEmail, error: emailError } = validateEmail(email);
  if (emailError) {
    formErrors.email = emailError;
    formErrors.hasErrors = true;
  }

  // TODO: Add validator.isStrongPassword helper to validate password
  if (!validator.isStrongPassword(password)) {
    formErrors.password =
      "Must contain atleast 8 characters, including 1 uppercase and 1 special character";
    formErrors.hasErrors = true;
  }

  if (password !== confirmPassword) {
    formErrors.hasErrors = true;
    formErrors.confirmPassword = "Repeat password does not match";
  }

  if (formErrors.hasErrors) {
    console.log("Sign up Form errors:", formErrors);
  }

  return { vUsername, vEmail, formErrors };
}

/**
 * Login a user
 * @param username_email - The username or email of the user
 * @param password - The password of the user
 * @returns The user and form errors. If there is an error, the user will be null and the form errors will have the error message otherwise it will return the auth cookie and form errors
 */
export async function loginUser({
  username_email,
  password,
}: {
  username_email: string;
  password: string;
}): Promise<{ auth: AuthCookie | null; formErrors: LoginFormErrors }> {
  const formErrors: LoginFormErrors = {
    username_email: "",
    password: "",
    general: "",
    hasErrors: false,
  };
  if (!username_email || !password) {
    formErrors.general = GENERAL_LOGIN_ERROR_STATEMENT;
    formErrors.hasErrors = true;
    return { auth: null, formErrors };
  }

  // check if it's an email or a username entered
  const selectOptions = {
    id: true,
    email: true,
    username: true,
    passwordHash: true,
    salt: true,
    avatarURL: true,
  };

  let user;
  if (validator.isEmail(username_email)) {
    try {
      user = await prisma.user.findUnique({
        where: {
          email: username_email,
        },
        select: selectOptions,
      });
    } catch (error) {
      console.error(
        "Internal Server Error, Contact support if this presists - Email login"
      );
      (formErrors.hasErrors = true),
        (formErrors.general = GENERAL_LOGIN_ERROR_STATEMENT);
      return { auth: null, formErrors };
    }
  } else {
    try {
      user = await prisma.user.findUnique({
        where: {
          username: username_email,
        },
        select: selectOptions,
      });
    } catch (error) {
      console.error(
        "Internal Server Error, Contact support if this presists - Username login"
      );
      (formErrors.hasErrors = true),
        (formErrors.general = GENERAL_LOGIN_ERROR_STATEMENT);
      return { auth: null, formErrors };
    }
  }

  // if no user found, return error
  if (!user) {
    //Perform fake password comparison to prevent timing attack vulnerability / leaking no user
    const dummyRandomPass =
      "a2VTzlVMypnht5I6ySoDHUTREHldaFjhucV8QmO6_W450V5BK1A5HW5px1XwMmmtHNf3dRauhKD71qr-R9NbvQ";
    const dummySalt = "dummy_salt_value";

    try {
      const fake = SafeComparePasswords({
        password: password,
        passwordHash: dummyRandomPass,
        salt: dummySalt,
      });
      // this could throw an error if after hashing, length isn't the same
    } catch (error) {
      console.error("Error comparing passwords", error);
    }

    formErrors.general = GENERAL_LOGIN_ERROR_STATEMENT;
    formErrors.hasErrors = true;
    return { auth: null, formErrors };
  }

  const authenticated = SafeComparePasswords({
    password,
    salt: user.salt,
    passwordHash: user.passwordHash,
  });

  if (!authenticated) {
    formErrors.general = GENERAL_LOGIN_ERROR_STATEMENT;
    formErrors.hasErrors = true;
    return { auth: null, formErrors };
  }

  // if authenticated, create a new sessionId -> store in DB -> and return authCookie object
  const sessionId = createRandomBytes({ format: "base64url", length: 32 }); // 32 bytes = 256bit entropy.. 16 = 128bit
  let session;
  try {
    session = await prisma.session.create({
      data: {
        sessionId,
        expiresAt: DEFAULT_SESSION_EXPIRY_DATE,
        userId: user.id,
      },
      select: {
        user: {
          select: {
            email: true,
            username: true,
            id: true,
            avatarURL: true,
          },
        },
        sessionId: true,
        expiresAt: true,
      },
    });
  } catch (error) {
    console.error("failed creating session while logging in", error);
    return { auth: null, formErrors };
  }
  session;
  const auth: AuthCookie = {
    email: session.user.email,
    sessionId: session.sessionId,
    username: session.user.username,
    userId: session.user.id,
    avatarURL: session.user.avatarURL,
  };
  return {
    auth: auth,
    formErrors,
  };
}

export function validateUsername(username: string): {
  username: string;
  error: string | null;
} {
  let error = null;
  if (validator.isLength(username, { min: 3, max: 24 })) {
    if (!validator.isAlphanumeric(username)) {
      error = "Invalid Username - Must be Alphanumeric";
    }
  } else {
    error = "Invalid Username - length between 3 and 24";
  }

  return { username, error };
}

export function validateEmail(email: string): {
  email: string;
  error: string | null;
} {
  let error = null;
  if (!validator.isEmail(email)) {
    error = "Incorrect email format";
  }

  return { email, error };
}
