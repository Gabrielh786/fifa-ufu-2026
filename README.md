# 🎮 E-Sports FIFA · Olimpíada Universitária UFU 2026

Sistema independente e reativo de chaveamento e somatória de pontos para o **FIFA Masculino (30 inscritos)** e **FIFA Feminino (29 inscritas)** da Olimpíada UFU 2026.

## 🚀 Funcionalidades

- **Chaveamento Bilateral Oficial:** 16-avos $\rightarrow$ Oitavas $\rightarrow$ Quartas $\rightarrow$ Semifinais $\rightarrow$ Grande Final (JG33), Decisão de 3º Lugar (JG34) e Consolação de 5º ao 8º lugar (Art. 79 Oficial).
- **Avanço em 1 Clique:** Ao clicar no atleta vencedor, ele avança e elimina o adversário automaticamente.
- **Sincronização em Nuvem Ao Vivo (Firebase Realtime Database):**
  - **Modo Operador:** A pessoa que estiver no evento atualizando as partidas clica nos vencedores e as alterações são enviadas instantaneamente para a nuvem.
  - **Modo Espectador / Telão:** Qualquer pessoa com o link acompanha os resultados atualizados automaticamente a cada 2.5s sem risco de cliques acidentais.
- **Tabela Somatória em Tempo Real:** Soma a pontuação oficial do Masculino e do Feminino para cada uma das 16 Associações Atléticas Acadêmicas (AAAs).
- **Gestão de Atletas:** Permite substituir atletas, editar nomes, alterar cabeças de chave ou restaurar o sorteio original do Congresso Técnico.
- **Exportação:** Exportação em planilha formatada para Excel (.csv) e impressão (.pdf).

---

## ⚡ Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor local
npm run dev
```

Ou execute o arquivo `iniciar.bat` dando dois cliques!

---

## 🌐 Como Publicar e Ter seu Link Próprio (Gratuito)

### Opção 1: Vercel (Recomendado - 1 minuto)
1. Suba este projeto para um novo repositório no seu GitHub (ex: `fifa-ufu-2026`).
2. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
3. Clique em **"Add New Project"**, selecione o repositório `fifa-ufu-2026` e clique em **Deploy**.
4. Pronto! Você terá seu link próprio (ex: `https://fifa-ufu-2026.vercel.app`).

### Opção 2: Netlify
1. Conecte o repositório no [netlify.com](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Clique em Deploy.
