document.getElementById('loginForm').addEventListener('Submit', async(event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('/login', {
        method: 'Post',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({username, password}),
    });

    const result = await response.json();
    if(response.ok) {
        alert('Login bem-sucedido');
        //redirecionamento ou realiza algo  com o token acess
    } else {
        alert(result.message || 'Erro ao fazer login');
    }
});