FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf

# ADD www/build /usr/share/nginx/html/
# # Use a Python image
# FROM python:3.11-slim
# WORKDIR /app
# COPY . .
# RUN pip install --no-cache-dir -r requirements.txt
# EXPOSE 8000
# CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
