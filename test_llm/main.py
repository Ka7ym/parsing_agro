from transformers import MarianMTModel, MarianTokenizer

# Модель для перевода с русского на английский
model_name = "Helsinki-NLP/opus-mt-ru-en"
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)

def translate_ru_to_en(text):
    # Токенизация
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    # Генерация перевода
    translated_tokens = model.generate(**inputs, max_length=512)
    # Декодируем
    translation = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)
    return translation[0]

# Пример использования
russian_text = "Препарат применяется для защиты растений от вредителей."
english_text = translate_ru_to_en(russian_text)
print("English:", english_text)
