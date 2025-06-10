import { createRandomBytes, scryptHash } from "./auth";
import { prisma } from "./prisma";
import type { SignUpFormErrors } from "./types";
import validator from "validator";

/**
 * Default session expiry date - 30 days
 */
export const DEFAULT_SESSION_EXPIRY_DATE = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
);

/**
 * Create a new user
 * @returns The user and form errors. If there is an error, the user will be null and the form errors will have the error message
 */
export async function createNewUser({
  username,
  email,
  displayName,
  password,
  ipAddress,
  userAgent,
}: {
  username: string;
  email: string;
  displayName: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const GENERAL_STATEMENT =
    "Error creating user, Contact support if this persists";
  console.log({ username, password, email }, "wtf");
  const { vUsername, vEmail, formErrors } = validate_signup_form({
    username,
    password,
    email,
  });
  if (formErrors.hasErrors) {
    console.log('lmfao"');
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
  email,
}: {
  username: string;
  password: string;
  email: string;
}) {
  const formErrors: SignUpFormErrors = {
    username: "",
    email: "",
    password: "",
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

  if (formErrors.hasErrors) {
    console.log("Sign up Form errors:", formErrors);
  }

  return { vUsername, vEmail, formErrors };
}

export function validateUsername(username: string): {
  username: string;
  error: string | null;
} {
  let error = null;
  console.log(username, "raaaan");
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
