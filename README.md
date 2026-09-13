# Hey there coder.

In this repo, I built a CNN (Convolutional Neural Network) to recognize handwritten digits (0–9) drawn on an interactive canvas.

All the data interpretation and model training steps can be found in [`CNN_Numbers.ipynb`](CNN_Numbers.ipynb) — it's not a crazy deep analysis, but gets the job done.

---

### What's under the hood:
- TensorFlow / Keras 
- fastAPI | uvicorn 
- Docker
- Hugging Face (kinda...)

---

## - To run the project

You can run it either directly on your machine or inside a Docker container.

### Building and Running a container (Recomended)
``` bash
docker build -t docker-app .

docker run -p 8000:8000 docker-app
```

### Creating a Python Virtual Environment
``` bash
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```
>[!NOTE]
> Tensorflow will only work in Python3.9 to Python3.12 versions, so it's important to know which version of Python you're going to use by typing 
>```bash
>which python3
>```

Once installed all the packages run the following code:
```bash
uvicorn app.main:app --port 8000
```



---
After picking one of those two options, open your browser and go to:

- >http://localhost:8000

You will see a canvas where you can draw any number you want and click Predict it!

## Thanks if you reached all up to this point. 