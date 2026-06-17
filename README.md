# 📚 SITREV David 2026

Projeto desenvolvido como avaliação da disciplina **Desenvolvimento Web - PPCA 2026**.

## 🚀 Tecnologias Utilizadas

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Django
* Django REST Framework
* PostgreSQL
* Gunicorn

---

## 📂 Estrutura do Projeto

```text
sitrevdavid2026/
├── sitrev-react/      # Frontend React
└── sitrev_backend/    # Backend Django
```

---

## 🌐 Deploy no Render

### Frontend

| Configuração      | Valor           |
| ----------------- | --------------- |
| Root Directory    | `sitrev-react`  |
| Build Command     | `npm run build` |
| Publish Directory | `dist`          |

### Backend

| Configuração          | Valor                                                         |
| --------------------- | ------------------------------------------------------------- |
| Root Directory        | `sitrev_backend`                                              |
| Build Command         | `pip install -r requirements.txt && python manage.py migrate` |
| Start Command         | `gunicorn core.wsgi:application`                              |
| --------------------- | ------------------------------------------------------------- |
| Variáveis de Ambiente | Valor                                                         |
| --------------------- | ------------------------------------------------------------- |
| KEY                   | `DATABASE_URL`                                                                  |
| VALUE                 | `postgresql://usuario:senha@host/database`                                   |


---

## 💻 Executando Localmente

### Frontend

```bash
cd sitrev-react
npm install
npm run dev
```

### Backend

```bash
cd sitrev_backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

