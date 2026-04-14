from flask import Flask, render_template, request, jsonify
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import jwt, datetime, json, base64, uuid

app = Flask(__name__)


def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/generate')
def generate():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    priv = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode()

    pub = key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode()

    numbers = key.public_key().public_numbers()
    e = b64url(numbers.e.to_bytes(3, 'big'))
    n = b64url(numbers.n.to_bytes(256, 'big'))

    kid = str(uuid.uuid4())

    jwks = {
        "keys": [{
            "kty": "RSA",
            "use": "sig",
            "kid": kid,
            "alg": "RS256",
            "n": n,
            "e": e
        }]
    }

    return jsonify({
        "private": priv,
        "public": pub,
        "jwks": jwks,
        "kid": kid
    })


@app.route('/jwt', methods=['POST'])
def create_jwt():
    data = request.json
    payload = json.loads(data['payload'])
    payload['exp'] = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

    token = jwt.encode(
        payload,
        data['private'],
        algorithm='RS256',
        headers={"kid": data['kid']}
    )

    return jsonify({"token": token})


if __name__ == '__main__':
    app.run(debug=True, host="127.0.0.1", port=5000)