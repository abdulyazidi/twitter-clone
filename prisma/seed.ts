import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "process";
import {
  PrismaClient,
  TWEET_TYPE,
  MEDIA_TYPE,
  type User,
  type Tweet,
} from "@prisma-app/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// Instantiate Prisma Client
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

// Promisify the scrypt function for async/await usage
const scryptAsync = promisify(scrypt);

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// DATA SAMPLES (No external libraries needed)
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const USER_DATA = [
  { username: "alex", displayName: "Alex" },
  { username: "brian", displayName: "Brian C." },
  { username: "casey", displayName: "Casey" },
  { username: "drew", displayName: "Drew P." },
  { username: "elliot", displayName: "Elliot" },
  { username: "finn", displayName: "Finn" },
  { username: "grace", displayName: "Grace" },
  { username: "harper", displayName: "Harper" },
  { username: "iris", displayName: "Iris" },
  { username: "jordan", displayName: "Jordan" },
];

const TWEET_CONTENT = [
  "Just deployed a new feature! #coding #webdev",
  "What's everyone's favorite TypeScript feature? Mine is mapped types.",
  "Thinking about learning Rust next. Any tips?",
  "The new Gemini 2.5 Pro model is incredibly fast.",
  "Finally finished my side project. It's a great feeling.",
  "Is it just me or is CSS getting more and more powerful?",
  "Hot take: SQL is still the best way to query data.",
  "Just had the best coffee. Ready to tackle the day! ☕️",
  "Looking for recommendations for a new mechanical keyboard.",
  "The sunset today was absolutely breathtaking.",
  "Who else is excited for the weekend?",
];

const MEDIA_URLS = {
  IMAGE: [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", // code
    "https://images.unsplash.com/photo-1550745165-9bc0b252726a", // retro tech
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836", // food
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8", // nature
  ],
  GIF: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXBpZ3N0a3JjYjZpM3U2aGZ0eHJobWpwZ214YWFlemVmcjZ1N2N0eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bGgsc5hKvanhC/giphy.gif",
  ],
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// HELPER FUNCTIONS
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

/**
 * Hashes a password with a random salt.
 */
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return {
    passwordHash: buf.toString("hex"),
    salt,
  };
}

/**
 * Gets a random element from an array.
 */
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gets a random number of unique elements from an array.
 */
function getRandomElements<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// SEEDING LOGIC
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

async function main() {
  console.log("🌱 Start seeding...");

  // 1. Clean up the database
  console.log("🧹 Cleaning up database...");
  await prisma.bookmark.deleteMany(); // NEW
  await prisma.like.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.media.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users and their profiles
  console.log(`👤 Creating ${USER_DATA.length} users...`);
  const createdUsers: User[] = [];
  for (const userData of USER_DATA) {
    const { passwordHash, salt } = await hashPassword("password123");
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: `${userData.username}@example.com`,
        passwordHash,
        salt,
        isPrivate: Math.random() > 0.8, // ~20% of users are private
        profile: {
          create: {
            displayName: userData.displayName,
            bio: `Hello! I'm ${userData.displayName}.`,
          },
        },
      },
    });
    createdUsers.push(user);
  }

  // 3. Create follow relationships
  console.log("🤝 Creating follow relationships...");
  for (const user of createdUsers) {
    const usersToFollow = getRandomElements(
      createdUsers.filter((u) => u.id !== user.id), // Can't follow yourself
      Math.floor(Math.random() * 5) + 1 // Follow 1-5 other users
    );
    await prisma.follow.createMany({
      data: usersToFollow.map((followingUser) => ({
        followerId: user.id,
        followingId: followingUser.id,
      })),
      skipDuplicates: true,
    });
  }

  // 4. Create tweets
  console.log("📝 Creating 100 tweets...");
  const createdTweets: Tweet[] = [];
  for (let i = 0; i < 100; i++) {
    const randomAuthor = getRandomElement(createdUsers);
    const tweetType = getRandomElement([
      TWEET_TYPE.TWEET,
      TWEET_TYPE.TWEET, // Make normal tweets more common
      TWEET_TYPE.TWEET,
      TWEET_TYPE.REPLY,
      TWEET_TYPE.QUOTE_TWEET,
      TWEET_TYPE.RETWEET,
    ]);

    let tweetData: any = {
      authorId: randomAuthor.id,
      type: tweetType,
      content:
        tweetType !== TWEET_TYPE.RETWEET
          ? getRandomElement(TWEET_CONTENT)
          : null,
    };

    // Add relationships for replies, quotes, and retweets
    if (createdTweets.length > 0) {
      const targetTweet = getRandomElement(createdTweets);
      if (tweetType === TWEET_TYPE.REPLY) {
        tweetData.parentTweetId = targetTweet.id;
      } else if (tweetType === TWEET_TYPE.QUOTE_TWEET) {
        tweetData.quotedTweetId = targetTweet.id;
      } else if (tweetType === TWEET_TYPE.RETWEET) {
        tweetData.retweetedTweetId = targetTweet.id;
      }
    }

    const tweet = await prisma.tweet.create({ data: tweetData });

    // Add media to some tweets
    if (Math.random() > 0.6) {
      // ~40% of tweets get media
      const mediaType = getRandomElement([MEDIA_TYPE.IMAGE, MEDIA_TYPE.GIF]);
      const url =
        mediaType === MEDIA_TYPE.IMAGE
          ? getRandomElement(MEDIA_URLS.IMAGE)
          : getRandomElement(MEDIA_URLS.GIF);

      await prisma.media.create({
        data: {
          tweetId: tweet.id,
          type: mediaType,
          url: url,
        },
      });
    }
    createdTweets.push(tweet);
  }

  // 5. Create likes
  console.log("❤️ Creating likes...");
  const likesToCreate = [];
  for (let i = 0; i < 200; i++) {
    likesToCreate.push({
      userId: getRandomElement(createdUsers).id,
      tweetId: getRandomElement(createdTweets).id,
    });
  }
  await prisma.like.createMany({
    data: likesToCreate,
    skipDuplicates: true,
  });

  // 6. Create bookmarks (NEW)
  console.log("🔖 Creating bookmarks...");
  const bookmarksToCreate = [];
  for (let i = 0; i < 150; i++) {
    bookmarksToCreate.push({
      userId: getRandomElement(createdUsers).id,
      tweetId: getRandomElement(createdTweets).id,
    });
  }
  await prisma.bookmark.createMany({
    data: bookmarksToCreate,
    skipDuplicates: true,
  });

  // 7. Update denormalized counts on tweets (UPDATED)
  console.log("🔄 Updating tweet counts...");
  for (const tweet of createdTweets) {
    const likeCount = await prisma.like.count({
      where: { tweetId: tweet.id },
    });
    const bookmarkCount = await prisma.bookmark.count({
      where: { tweetId: tweet.id },
    });
    const replyCount = await prisma.tweet.count({
      where: { parentTweetId: tweet.id },
    });
    const quoteCount = await prisma.tweet.count({
      where: { quotedTweetId: tweet.id },
    });
    const retweetCount = await prisma.retweet.count({
      where: { tweetId: tweet.id },
    });

    await prisma.tweet.update({
      where: { id: tweet.id },
      data: {
        likeCount,
        bookmarkCount, // NEW
        replyCount,
        quoteCount,
        retweetCount,
      },
    });
  }

  // 8. Update denormalized counts on users (NEW)
  console.log("🔄 Updating user counts...");
  for (const user of createdUsers) {
    const followersCount = await prisma.follow.count({
      where: { followingId: user.id },
    });
    const followingCount = await prisma.follow.count({
      where: { followerId: user.id },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        followersCount,
        followingCount,
      },
    });
  }

  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
