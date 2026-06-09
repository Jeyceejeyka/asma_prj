def set_auth_cookies(response, access_token, refresh_token, secure=False):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite="None",
        max_age=60 * 10,  # 10 minutes
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite="None",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    
def clear_auth_cookies(response):
    response.delete_cookie(
        "access_token",
        path="/",
        samesite="None",
    )

    response.delete_cookie(
        "refresh_token",
        path="/",
        samesite="None",
    )

    return response