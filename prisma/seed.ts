import { PrismaClient, TWEET_TYPE, MEDIA_TYPE } from "@prisma-app/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "process";

// Instantiate Prisma Client
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed process...");

  // 1. Clean up the database to ensure a fresh start
  console.log("🧹 Cleaning up existing data...");
  // The order of deletion is important to avoid foreign key constraint violations
  await prisma.like.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.media.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  console.log("👤 Creating users...");
  const alice = await prisma.user.create({
    data: {
      username: "alice",
      email: "alice@example.com",
      passwordHash: "hash_for_alice",
      salt: "salt_for_alice",
      isPrivate: false,
      profile: {
        create: {
          displayName: "Alice Smith",
          bio: "Software developer and coffee enthusiast.",
          location: "San Francisco, CA",
          website: "https://alice.dev",
        },
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      username: "bob",
      email: "bob@example.com",
      passwordHash: "hash_for_bob",
      salt: "salt_for_bob",
      isPrivate: false,
      profile: {
        create: {
          displayName: "Bob Johnson",
          bio: "Designer, photographer, and traveler.",
          avatarURL: "https://i.pravatar.cc/150?u=bob",
        },
      },
    },
  });

  const charlie = await prisma.user.create({
    data: {
      username: "charlie",
      email: "charlie@example.com",
      passwordHash: "hash_for_charlie",
      salt: "salt_for_charlie",
      isPrivate: true, // Charlie has a private profile
      profile: {
        create: {
          displayName: "Charlie Brown",
          bio: "Just a regular person.",
        },
      },
    },
  });

  console.log(
    `✨ Created 3 users: ${alice.username}, ${bob.username}, ${charlie.username}`
  );

  // 3. Create Follow relationships
  console.log("🤝 Creating follow relationships...");
  await prisma.follow.createMany({
    data: [
      { followerId: alice.id, followingId: bob.id }, // Alice follows Bob
      { followerId: bob.id, followingId: alice.id }, // Bob follows Alice
      { followerId: charlie.id, followingId: alice.id }, // Charlie follows Alice
    ],
  });
  console.log("✅ Follows created.");

  // 4. Create Tweets
  console.log("🐦 Creating tweets...");

  // A simple text tweet by Alice
  const tweet1 = await prisma.tweet.create({
    data: {
      type: TWEET_TYPE.TWEET,
      authorId: alice.id,
      content: "Hello, world! This is my first tweet.",
    },
  });

  // A tweet with an image by Bob
  const tweet2 = await prisma.tweet.create({
    data: {
      type: TWEET_TYPE.TWEET,
      authorId: bob.id,
      content: "Check out this beautiful sunset!",
      media: {
        create: {
          type: MEDIA_TYPE.IMAGE,
          url: "https://picsum.photos/seed/sunset/1200/800",
        },
      },
    },
  });

  // A reply by Alice to Bob's tweet
  const tweet3_reply = await prisma.tweet.create({
    data: {
      type: TWEET_TYPE.REPLY,
      authorId: alice.id,
      content: "Wow, that's a stunning photo!",
      parentTweetId: tweet2.id,
    },
  });

  // A quote tweet by Charlie of Alice's first tweet
  const tweet4_quote = await prisma.tweet.create({
    data: {
      type: TWEET_TYPE.QUOTE_TWEET,
      authorId: charlie.id,
      content: "Couldn't agree more.",
      quotedTweetId: tweet1.id,
    },
  });

  // A retweet by Bob of Alice's first tweet
  const tweet5_retweet = await prisma.tweet.create({
    data: {
      type: TWEET_TYPE.RETWEET,
      authorId: bob.id,
      retweetedTweetId: tweet1.id,
      // Retweets typically don't have their own content
    },
  });

  console.log("✅ Tweets, a reply, a quote, and a retweet created.");

  // 5. Create Likes
  console.log("❤️ Creating likes...");
  await prisma.like.createMany({
    data: [
      { userId: charlie.id, tweetId: tweet1.id }, // Charlie likes Alice's tweet
      { userId: alice.id, tweetId: tweet2.id }, // Alice likes Bob's tweet
      { userId: bob.id, tweetId: tweet1.id }, // Bob also likes Alice's tweet
    ],
  });
  console.log("✅ Likes created.");

  // 6. Create Mentions
  console.log("🗣️ Creating mentions...");
  // Let's add a new tweet where Alice mentions Bob
  const tweet6_mention = await prisma.tweet.create({
    data: {
      type: TWEET_TYPE.TWEET,
      authorId: alice.id,
      content: `Having a great discussion with @${bob.username}!`,
      mentions: {
        create: {
          userId: bob.id,
        },
      },
    },
  });
  console.log("✅ Mentions created.");

  // 7. Update Denormalized Counters
  // This step is crucial for keeping your data consistent.
  console.log("🔄 Updating denormalized counters on tweets...");

  await prisma.tweet.update({
    where: { id: tweet1.id },
    data: {
      likeCount: 2, // Liked by Charlie and Bob
      quoteCount: 1, // Quoted by Charlie
      retweetCount: 1, // Retweeted by Bob
    },
  });

  await prisma.tweet.update({
    where: { id: tweet2.id },
    data: {
      likeCount: 1, // Liked by Alice
      replyCount: 1, // Replied to by Alice
    },
  });

  console.log("✅ Counters updated.");
  console.log("🎉 Seed process finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred during the seed process:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma Client connection
    await prisma.$disconnect();
  });
