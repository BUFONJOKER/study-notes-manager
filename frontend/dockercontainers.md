### Build and Run Frontend Docker Container

```powershell
# Build the Docker image
docker build -t study-notes-manager-frontend .

# Run the container without environment variables
docker run --rm -p 3000:3000 --name study-notes-frontend study-notes-manager-frontend

# Run the container with environment variables from .env
docker run --rm -p 3000:3000 --env-file .env --name study-notes-frontend study-notes-manager-frontend
```

**Note:** Run only one of the two `docker run` commands at a time. Use the `--env-file .env` version if your frontend requires runtime environment variables. Variables prefixed with `NEXT_PUBLIC_` are generally embedded during the build, so pass those using Docker build arguments if required.

**Access the frontend:**
- Next.js application: http://localhost:3000