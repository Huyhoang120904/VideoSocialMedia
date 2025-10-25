# TheSocial Backend Setup

## Environment Variables

Before running the application, you need to set up the following environment variables:

### Required Environment Variables

1. **MONGODB_URL**: MongoDB connection string
   - Default: `mongodb://root:rootpassword123@localhost:27017/thesocial?authSource=admin`

2. **CORS_URL**: Frontend URL for CORS configuration
   - Default: `http://localhost:3000`

3. **JWT_SECRET**: Secret key for JWT token signing
   - **IMPORTANT**: Change this to a secure, random string in production

4. **JWT_DURATION**: JWT token expiration time in milliseconds
   - Default: `86400000` (24 hours)

5. **JWT_REFRESH_DURATION**: JWT refresh token expiration time in milliseconds
   - Default: `604800000` (7 days)

6. **FILE_UPLOAD_DIR**: Directory for file uploads
   - Default: `uploads`

7. **OPENAI_API_KEY**: OpenAI API key for AI chat functionality
   - **REQUIRED**: Get this from [OpenAI Platform](https://platform.openai.com/api-keys)

## Setup Instructions

### Option 1: Using Docker Compose (Recommended)

1. Set your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY=your-actual-openai-api-key-here
   ```

2. Start all services:
   ```bash
   docker-compose up -d
   ```

### Option 2: Running Locally

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your actual values:
   ```bash
   # Update these values with your actual configuration
   OPENAI_API_KEY=your-actual-openai-api-key-here
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   ```

3. Start MongoDB and Kafka using Docker:
   ```bash
   docker-compose up -d mongodb kafka
   ```

4. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

## Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and set it as `OPENAI_API_KEY` environment variable

## Troubleshooting

### Common Issues

1. **BeanCreationException for openAIConfig**: Make sure `OPENAI_API_KEY` is set
2. **MongoDB connection failed**: Ensure MongoDB is running on port 27017
3. **Kafka connection failed**: Ensure Kafka is running on port 9092

### Health Checks

- Application: http://localhost:8082/api/v1/actuator/health
- MongoDB: Check if container `thesocial-mongodb` is healthy
- Kafka: Check if container `thesocial-kafka` is running
