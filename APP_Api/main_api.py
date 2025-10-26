from python_api import connect_ssh, send_prompt, Config


def main(prompt: str = None):
    """
    Run LLM query with configuration from model_config.txt.

    Args:
        prompt: İsteğe bağlı prompt. Verilmezse config dosyasından okur.
    """
    # Default prompt config'den
    if prompt is None:
        cfg = Config.get()
        if "PROMPTS" in cfg and "DEFAULT_PROMPT" in cfg["PROMPTS"]:
            prompt = cfg["PROMPTS"]["DEFAULT_PROMPT"]
        else:
            prompt = "Hello World?"

    # Tüm ayarlar otomatik olarak config'den gelecek
    ssh = connect_ssh()  # Config'den okur
    try:
        res = send_prompt(ssh, prompt)  # Config'den okur
        print(res.get("text", ""))
        if res.get("stderr"):
            print("LLM STDERR:\n", res.get("stderr"))
    finally:
        ssh.close()


if __name__ == "__main__":
    # Prompt'u ya üstteki DEFAULT_PROMPT'tan al ya da burada değiştir
    main()
