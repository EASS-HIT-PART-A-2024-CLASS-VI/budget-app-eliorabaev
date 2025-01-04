# Use the official lightweight Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory in the container to /app
WORKDIR /app

# Copy the requirements file into the working directory
COPY ./app/requirements.txt /app/requirements.txt

# Install the dependencies specified in the requirements file
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the entire application into the working directory
COPY ./app /app

# Expose port 8000 to allow outside access
EXPOSE 8000

# Set environment variable to prevent Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Command to run the application using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
