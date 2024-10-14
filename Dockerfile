# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies specified in package.json
# Note: If you have a package-lock.json, the exact versions specified will be installed
RUN npm install

# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the command to start your application when the container launches
# CMD ["node", "swagger"] would be used if "swagger" is a script file
# But based on your package.json, it seems like you want to start using npm start which runs "node swagger"
CMD ["npm", "start"]
