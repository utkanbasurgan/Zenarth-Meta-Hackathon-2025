import argparse
from python_api import *

# -----------------------------
# Örnek kullanım
# -----------------------------

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Send prompt to LLM via SSH')
    parser.add_argument('prompt', help='The prompt to send to the LLM')
    parser.add_argument('--model', default='llama3.1:8b', help='Model to use (default: llama3.1:8b)')
    parser.add_argument('--temperature', type=float, default=0.5, help='Temperature setting (default: 0.5)')
    parser.add_argument('--num-predict', type=int, default=4096, help='Number of tokens to predict (default: 2048)')
    parser.add_argument('--timeout', type=int, default=180, help='Timeout in seconds (default: 180)')
    
    args = parser.parse_args()
    
    HOST = "83.104.230.246"
    PORT = 31103
    USER = "root"

    KEY_PATH = "./llama_ssh.txt"
    PASSFILE_PATH = "./passphrase.txt"

    ssh = connect_ssh(HOST, PORT, USER, KEY_PATH, PASSFILE_PATH)

<<<<<<< Updated upstream
    try:
        res = send_prompt(
            ssh,
            prompt=args.prompt,
            model=args.model,
            options={"temperature": args.temperature, "num_predict": args.num_predict},
            timeout=args.timeout,
        )
        #print("LLM OK:", res["ok"])
        print(res["text"])
=======
    prompt = """
    Hello World?
    """

    try:
        # LLM çağrısı: sadece prompt gönder
        res = send_prompt(
            ssh,
            prompt=(prompt),
            model="llama3.1:8b",
            options={"num_predict": 4096},  # uzun cevap güvenliği
            timeout=600,
        )
        print(res["text"])

>>>>>>> Stashed changes
        if res["stderr"]:
            print("LLM STDERR:\n", res["stderr"])

        res = send_file_inline(
            ssh,
            filepath="DATAS_Main\sorted_data.xlsx",
            question="Give me python codes that to show what this data about ?",
            model="llama3.1:8b",
        )
        print(res["text"])

    finally:
        ssh.close()