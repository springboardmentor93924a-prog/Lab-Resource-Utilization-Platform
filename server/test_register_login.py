import json
import urllib.request
import urllib.error

user = {
    'firstName': 'Registered',
    'lastName': 'User',
    'email': 'registered.user@university.edu',
    'password': 'Registered123!',
    'phone': '+1-555-1234',
    'role': 'Researcher',
    'institution': 'Global Science University',
    'department': 'Biotech',
}

backend_url = 'http://localhost:4000/api/auth'
proxy_url = 'http://localhost:3004/api/auth'

for base_url in [backend_url, proxy_url]:
    print('--- TEST', base_url, '---')
    # register
    register_url = f'{base_url}/register'
    login_url = f'{base_url}/login'
    data = json.dumps(user).encode('utf-8')
    req = urllib.request.Request(register_url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as res:
            print('REGISTER STATUS', res.status)
            print(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print('REGISTER STATUS', e.code)
        print(e.read().decode('utf-8'))
    except Exception as e:
        print('REGISTER ERROR', e)

    # login
    login_data = json.dumps({'email': user['email'], 'password': user['password']}).encode('utf-8')
    req = urllib.request.Request(login_url, data=login_data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as res:
            print('LOGIN STATUS', res.status)
            print(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print('LOGIN STATUS', e.code)
        print(e.read().decode('utf-8'))
    except Exception as e:
        print('LOGIN ERROR', e)
