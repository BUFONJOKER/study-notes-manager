### Build and Run Backend Docker Container

```powershell
# Build the Docker image
docker build -t study-notes-manager-backend .

# Run the container without environment variables
docker run --rm -p 8000:8000 --name study-notes-api study-notes-manager-backend

# Run the container with environment variables from .env
docker run --rm -p 8000:8000 --env-file .env --name study-notes-api study-notes-manager-backend
```

**Note:** Run only one of the two `docker run` commands at a time. Use the `--env-file .env` version if your backend requires environment variables.

**Access the API:**
- API: http://localhost:8000
- Swagger documentation: http://localhost:8000/docs