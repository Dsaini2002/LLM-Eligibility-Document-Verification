import requests
import random
import string

BASE_URL = "http://localhost:5000"

def random_email(role):
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"test_{role}_{suffix}@example.com"


def print_result(test_name, passed, response):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {test_name}")

    try:
        print(f"       Status: {response.status_code}")
        print(f"       Response: {response.json()}")
    except Exception:
        print(f"       Response: {response.text}")

    print()


def signup(full_name, email, password, role):
    return requests.post(
        f"{BASE_URL}/api/auth/signup",
        json={
            "fullName": full_name,
            "email": email,
            "password": password,
            "role": role
        }
    )


def login(email, password):
    return requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": email,
            "password": password
        }
    )


def protected_request(endpoint, token):
    return requests.get(
        f"{BASE_URL}{endpoint}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )


def main():
    print("\n========================================")
    print("       LLM ELIGIBILITY AUTH TEST")
    print("========================================\n")

    password = "Password@123"

    accounts = {
        "applicant": {
            "name": "Python Test Applicant",
            "email": random_email("applicant"),
            "token": None
        },
        "organization": {
            "name": "Python Test Organization",
            "email": random_email("organization"),
            "token": None
        },
        "admin": {
            "name": "Python Test Admin",
            "email": random_email("admin"),
            "token": None
        }
    }

    passed = 0
    total = 0

    # ========================================
    # 1. SIGNUP TESTS
    # ========================================

    print("---------- SIGNUP TESTS ----------\n")

    for role, account in accounts.items():
        total += 1

        response = signup(
            account["name"],
            account["email"],
            password,
            role
        )

        success = (
            response.status_code == 201
            and response.json().get("success") is True
        )

        if success:
            passed += 1

        print_result(
            f"{role.capitalize()} Signup",
            success,
            response
        )

    # ========================================
    # 2. LOGIN TESTS
    # ========================================

    print("---------- LOGIN TESTS ----------\n")

    for role, account in accounts.items():
        total += 1

        response = login(
            account["email"],
            password
        )

        try:
            data = response.json()
        except Exception:
            data = {}

        token = data.get("token")

        success = (
            response.status_code == 200
            and data.get("success") is True
            and token is not None
        )

        if success:
            account["token"] = token
            passed += 1

        print_result(
            f"{role.capitalize()} Login",
            success,
            response
        )

    # ========================================
    # 3. WRONG PASSWORD
    # ========================================

    print("---------- SECURITY TESTS ----------\n")

    total += 1

    response = login(
        accounts["admin"]["email"],
        "WrongPassword123"
    )

    try:
        data = response.json()
    except Exception:
        data = {}

    success = (
        response.status_code == 401
        and data.get("success") is False
    )

    if success:
        passed += 1

    print_result(
        "Wrong Password Rejected",
        success,
        response
    )

    # ========================================
    # 4. NO TOKEN
    # ========================================

    total += 1

    response = requests.get(
        f"{BASE_URL}/api/users/admin-area"
    )

    try:
        data = response.json()
    except Exception:
        data = {}

    success = (
        response.status_code == 401
        and data.get("success") is False
    )

    if success:
        passed += 1

    print_result(
        "No JWT Token Rejected",
        success,
        response
    )

    # ========================================
    # 5. CORRECT ROLE ACCESS
    # ========================================

    print("---------- ROLE AUTHORIZATION ----------\n")

    role_endpoints = {
        "applicant": "/api/users/applicant-area",
        "organization": "/api/users/organization-area",
        "admin": "/api/users/admin-area"
    }

    for role, endpoint in role_endpoints.items():
        total += 1

        token = accounts[role]["token"]

        response = protected_request(
            endpoint,
            token
        )

        try:
            data = response.json()
        except Exception:
            data = {}

        success = (
            response.status_code == 200
            and data.get("success") is True
        )

        if success:
            passed += 1

        print_result(
            f"{role.capitalize()} Can Access Own Area",
            success,
            response
        )

    # ========================================
    # 6. WRONG ROLE ACCESS
    # ========================================

    wrong_role_tests = [
        (
            "Applicant Cannot Access Organization",
            "applicant",
            "/api/users/organization-area"
        ),
        (
            "Applicant Cannot Access Admin",
            "applicant",
            "/api/users/admin-area"
        ),
        (
            "Organization Cannot Access Applicant",
            "organization",
            "/api/users/applicant-area"
        ),
        (
            "Organization Cannot Access Admin",
            "organization",
            "/api/users/admin-area"
        ),
        (
            "Admin Cannot Access Applicant",
            "admin",
            "/api/users/applicant-area"
        ),
        (
            "Admin Cannot Access Organization",
            "admin",
            "/api/users/organization-area"
        )
    ]

    for test_name, role, endpoint in wrong_role_tests:
        total += 1

        token = accounts[role]["token"]

        response = protected_request(
            endpoint,
            token
        )

        try:
            data = response.json()
        except Exception:
            data = {}

        success = (
            response.status_code == 403
            and data.get("success") is False
        )

        if success:
            passed += 1

        print_result(
            test_name,
            success,
            response
        )

    # ========================================
    # FINAL RESULT
    # ========================================

    print("========================================")
    print("              TEST RESULT")
    print("========================================")

    print(f"\nPassed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")

    if passed == total:
        print("\nALL TESTS PASSED")
    else:
        print("\nSOME TESTS FAILED")

    print("========================================\n")


if __name__ == "__main__":
    main()