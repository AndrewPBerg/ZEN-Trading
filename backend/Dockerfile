# python dockerfile for backend

#Uses as base
FROM python:3.11-slim

#Goes to the app directory
WORKDIR /app

COPY requirements.txt ./

#Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

#Copy the application files
COPY . .

#Set port environment variable
ENV PORT=9669

#Expose the port
EXPOSE 9669

CMD ["npm", "start"]

