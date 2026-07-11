// Skip t3-env validation in test environment
process.env.SKIP_ENV_VALIDATION = '1';

// Provide required environment variables for tests that exercise
// modules transitively importing env validation
process.env.MONGODB_URI              = process.env.MONGODB_URI || "mongodb://localhost:27017/test";
process.env.JWT_SECRET               = process.env.JWT_SECRET || "test-jwt-secret-at-least-32-chars-long-for-test";
process.env.NEXTAUTH_SECRET          = process.env.NEXTAUTH_SECRET || "test-secret";
process.env.NEXT_PUBLIC_SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
process.env.CLOUDINARY_CLOUD_NAME    = process.env.CLOUDINARY_CLOUD_NAME || "test-cloud";
process.env.CLOUDINARY_API_KEY       = process.env.CLOUDINARY_API_KEY || "test-key";
process.env.CLOUDINARY_API_SECRET    = process.env.CLOUDINARY_API_SECRET || "test-secret";
process.env.RESEND_API_KEY           = process.env.RESEND_API_KEY || "re_test_key";
process.env.UPSTASH_REDIS_REST_URL   = process.env.UPSTASH_REDIS_REST_URL || "https://test.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "test-token";
