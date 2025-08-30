import jwt 
def verify_token(token, user_pool_id,region):
    try:
        decoded = jwt.decoded(token, options ={"verify_signature":False})
        return decoded['sub']
    except Exception as e:
        raise Exception("Invalid token:" + str(e))