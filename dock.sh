
#!/bin/bash
docker exec -it backend bash -c "python manage.py makemigrations && python manage.py migrate"