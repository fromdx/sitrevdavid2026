import { useState } from 'react';

export default function Perfil() {
  const [senhas, setSenhas] = useState({ senha_atual: '', nova_senha: '' });
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });
  const token = localStorage.getItem('access_token');

  const handleTrocaSenha = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', erro: false });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/alterar-senha/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(senhas)
      });

      const data = await response.json();

      if (!response.ok) {
        // Captura os erros de validação do Django (ex: senha atual errada)
        const erroMsg = data.senha_atual ? data.senha_atual[0] : 'Falha ao alterar senha.';
        throw new Error(erroMsg);
      }

      setMensagem({ texto: '✅ Sua senha foi alterada com sucesso!', erro: false });
      setSenhas({ senha_atual: '', nova_senha: '' }); // Limpa o formulário
    } catch (err) {
      setMensagem({ texto: `❌ ${err.message}`, erro: true });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '40px auto' }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '10px' }}>🔐 Alterar Minha Senha</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Digite sua senha atual e escolha uma nova credencial de acesso.</p>

        {mensagem.texto && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', background: mensagem.erro ? '#fff5f5' : '#f0fff4', color: mensagem.erro ? '#c53030' : '#22543d', fontWeight: 'bold' }}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleTrocaSenha}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Senha Atual</label>
            <input 
              type="password" 
              value={senhas.senha_atual} 
              onChange={e => setSenhas({ ...senhas, senha_atual: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nova Senha</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              value={senhas.nova_senha} 
              onChange={e => setSenhas({ ...senhas, nova_senha: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
              required 
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Atualizar Credenciais
          </button>
        </form>
      </div>
    </div>
  );
}
