# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /src

# Copy the application files into the working directory
COPY . /src

# Install the application dependencies
RUN npm install

# Define the entry point for the container
CMD ["npm", "start"]

# Expose the port the application runs on
EXPOSE 8080
