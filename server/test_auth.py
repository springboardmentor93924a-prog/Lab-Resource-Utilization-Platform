import json
import urllib.request
import urllib.error

user = {
    'email': 'nisha.patel@university.edu',
    'password': 'Password123!',
}

urls = [
    'http://localhost:4000/api/auth/login',
    'http://localhost:3004/api/auth/login',
]

for url in urls:
    data = json.dumps(user).encode('utf-8')
    request = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request) as response:
            body = response.read().decode('utf-8')
            print('URL:', url)
            print('STATUS:', response.status)
            print('BODY:', body)
    except urllib.error.HTTPError as error:
        print('URL:', url)
        print('STATUS:', error.code)
        print('BODY:', error.read().decode('utf-8'))
    except Exception as exc:
        print('URL:', url)
        print('ERROR:', exc)
