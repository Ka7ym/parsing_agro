from googletrans import Translator

translator = Translator()

russian_text = "Препарат применяется для защиты растений от вредителей."
translation = translator.translate(russian_text, src='ru', dest='en')

print("Original:", russian_text)
print("English:", translation.text)
