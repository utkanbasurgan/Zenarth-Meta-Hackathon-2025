from python_api import *

# -----------------------------
# Örnek kullanım
# -----------------------------
if __name__ == "__main__":
    HOST = "83.104.230.246"
    PORT = 31103
    USER = "root"

    # DİKKAT: gerçek dosya yollarını yaz
    KEY_PATH = "./APP_Api/llama_ssh.txt"  # PEM/KEY dosyanın gerçek adı/uzantısı
    PASSFILE_PATH = "./App_api/passphrase.txt"

    ssh = connect_ssh(HOST, PORT, USER, KEY_PATH, PASSFILE_PATH)

    try:
        # Basit test: echo çalışıyor mu?
        code, out, err = run_remote(ssh, "echo Hello World", timeout=30)
        print("echo exit_status:", code)
        print("echo stdout:", out)

        # LLM çağrısı: sadece prompt gönder
        res = send_prompt(
            ssh,
            prompt="utkan basurgan",
            model="llama3.1:8b",
            options={"temperature": 0.4, "num_predict": 128},  # istersen kaldır
            timeout=180,
        )
        print("LLM OK:", res["ok"])
        print("LLM TEXT:\n", res["text"])
        if res["stderr"]:
            print("LLM STDERR:\n", res["stderr"])

    finally:
        ssh.close()
