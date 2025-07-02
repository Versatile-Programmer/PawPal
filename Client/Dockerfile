# Step:1: Build the react App
FROM node:20-alpine AS build

# setting the working directory inside container
WORKDIR /app

# copy package.json file 
COPY package*.json ./

RUN npm install

# copy the rest of source code of application
COPY . .

RUN npm run build

# Step 2: serve the app-using nginx
FROM nginx:stable-alpine

# set the working directory for nginx
WORKDIR /usr/share/nginx/html

# Remove default page of nginx
RUN rm -rf ./*

# copy from above stage which we have named build
COPY --from=build /app/dist .

# Copy a custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# The default Nginx command will start the server automatically.
CMD ["nginx", "-g", "daemon off;"]

