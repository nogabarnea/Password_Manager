import random
import string
SECRET_KEY = "NOGA1234!"


def encrypt(text):
    if not text:
        return ""
    encrypted = ""
    for i in range(len(text)):
        text_letter = text[i]
        key_letter = SECRET_KEY[i % len(SECRET_KEY)] # אות מהמפתח הסודי
        encrypted_value = ord(text_letter) ^ ord(key_letter) # XOR בין האותיות
        encrypted += chr(encrypted_value) # המרה חזרה לתו
    res = string_to_base64(encrypted)
    return res


def decrypt(encrypted_text):
    if not encrypted_text:
        return ""
    encrypted = base64_to_string(encrypted_text)
    decrypted = ""
    for i in range(len(encrypted)):
        encrypted_char = encrypted[i]
        key_char = SECRET_KEY[i % len(SECRET_KEY)]
        decrypted_value = ord(encrypted_char) ^ ord(key_char) # XOR שוב - אותו דבר
        decrypted += chr(decrypted_value)
    return decrypted


##########################################
def string_to_base64(text):
    result = ""
    for char in text:
        num = ord(char)
        hex_value = format(num, '02x')
        result += hex_value
    return result

def base64_to_string(encoded):
    result = ""
    for i in range(0, len(encoded), 2):
        hex_pair = encoded[i:i+2]
        num = int(hex_pair, 16)
        result += chr(num)
    return result
########################################

def generate_password(length):
    chars = string.ascii_letters + string.digits + "!@#$%" # מאגר תווים
    password = ""
    for i in range(length):
        random_char = random.choice(chars)
        password += random_char
    return password
