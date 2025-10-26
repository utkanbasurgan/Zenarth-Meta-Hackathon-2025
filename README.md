# Llama Hackathon 2025 - Zenarth AI Team

## Problem Tanımı

Küçük ölçekli girişimler ve tek başına çalışan geliştiriciler, web uygulamalarını 7/24 izleyebilecek kaynaklara genellikle sahip değildir. Beklenmedik hatalar örneğin bir servis kesintisi, bozulmuş görseller veya hatalı kullanıcı ara yüzü öğeleri çoğu zaman fark edilmeden saatlerce sistemde kalabilir. Bu durum kullanıcı deneyimini olumsuz etkiler, gelir kaybına ve itibar zedelenmesine yol açar. Mevcut izleme araçları genellikle sadece hatayı tespit etmekle sınırlıdır; bu hataları gerçek zamanlı olarak düzeltme veya kullanıcıya düzgün bir şekilde yansıtma kabiliyetine sahip değildir. Sonuç olarak, geliştiriciler hâlâ manuel müdahaleye ve zaman kaybına bağımlı kalmakta, bu da ciddi verimsizlik yaratmaktadır.

## Çözüm

Zen AI, küçük ekipler ve bireysel geliştiriciler için tasarlanmış Llama 3.1-8B tabanlı, akıllı, kendini iyileştirebilen bir web izleme sistemi sunar. Zen AI, web uygulamasını her 10 saniyede bir aktif olarak tarar, olası hataları tespit eder ve bunları üç kategoriye ayırır: basit, orta, ve kritik. Basit hatalar sistem tarafından otomatik olarak düzeltilir, böylece kullanıcı deneyimi kesintisiz devam eder ve küçük problemler için geliştiricinin vaktini harcamasına gerek kalmaz. Orta düzeydeki hatalarda, Zen AI ilgili alanı otomatik olarak “Bakımda” veya “Düzeltiliyor” mesajıyla kamufle eder ve geliştiriciye anında bildirim gönderir, kullanıcı ise hata mesajını görmediği için daha olumlu bir deneyim ile karşılaşır. Kritik hatalar ise uygulamanın temel işlevselliğini etkileyen durumlarda “error” olarak bırakılır ve geliştiriciye acil uyarı iletilir.



Bu yapı sayesinde Zen AI, web uygulamalarını kendi kendini onarabilen, hata anında kullanıcıyı koruyan ve geliştiriciye minimum müdahale gerektiren akıllı sistemler hâline getirir. Böylece hem kullanıcı memnuniyeti artar hem de geliştiricinin sistem üzerindeki yükü azalır.

## Tech Stack

ANLATILACAK

* Python
* Ollama
* Llama 3.1

## Altyapı

ANLATILACAK

1. We hosted LLAMA model on Azure GPU VM with A100 GPU.
2. We used Ollama for inference over different models

## LLAMA Modeli

ANLATILACAK

LLAMA3.1-70b instruct finetune and LLAMA3.1-8b instruct finetune models were used for the project.
LLAMA3.1-8b instruct finetune model was used for smaller tasks and agents while LLAMA3.1-70b instruct finetune model was used for larger tasks and agents.



## Kod Nasıl Çalıştırılır?

ANLATILACAK

1. Clone the repository
2. Install the requirements - ollama
3. Open the juptyer notebook fill the prompts and system instructions in the code and run the code

## Takım Üyeleri

1. Utkan Başurgan
2. Batuhan Odçıkın
3. Kamran Yağız Yaldız
4. Burak Yunus Belen

Note: For the sake of privacy, we have not included the dataset and the prompts in this repository. Please reach out to us for the same.
