def normalize_phone(phone: str) -> str:
    """
    Normalize phone number to 2547XXXXXXXX format.
    """
    phone = phone.strip()
    if phone.startswith('+'):
        phone = phone[1:]
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    return phone
