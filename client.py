import requests  # Import requests module

def make_requests():
    # Make a POST request with data
    post_response = requests.post('http://httpbin.org/post', data={'key': 'value'})
    print('POST request:')
    print('Status Code:', post_response.status_code)
    print('Response Body:', post_response.json())

    # Make a GET request
    get_response = requests.get('http://httpbin.org/get')
    print('\nGET request:')
    print('Status Code:', get_response.status_code)
    print('Response Body:', get_response.json())

if __name__ == "__main__":
    make_requests()  # Execute the requests
