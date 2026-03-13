# Scanner de QR Code Premium 📷🔒

Bem-vindo ao repositório do **Scanner de QR Code Premium**, uma aplicação Web de alta performance desenvolvida para oferecer uma leitura rápida e segura de códigos QR diretamente no navegador.

<div align="center">
  <sub>Desenvolvido por <b>Thiago Marques Luiz</b> - Equipe de TI Colégio Carbonell</sub>
</div>

---

## 🎯 Sobre o Projeto

Este projeto consiste em um leitor de QR Code construído com tecnologias Web nativas (`HTML5`, `CSS3` e `JavaScript Vanilla`). Ele se destaca por sua interface moderna (*Glassmorphism*, animações fluídas e design responsivo) e, principalmente, por sua robusta arquitetura de segurança, pensada para combater vulnerabilidades comuns em leitores genéricos.

A aplicação utiliza a biblioteca assíncrona `html5-qrcode` por baixo dos panos, envelopada em uma arquitetura orientada a serviços para facilitar a manutenção e escalabilidade.

## ✨ Principais Funcionalidades

- **Leitura em Tempo Real**: Captura e decodifica URLs e textos instantaneamente usando a câmera do dispositivo.
- **Design Dinâmico e Responsivo**: Layout que se adapta perfeitamente a smartphones orientados em modo retrato e telas de desktop.
- **Micro-interações Premium**: Sistema de *badges*, *spinners* de carregamento suaves e botões interativos para melhorar a UX.
- **Feedback Háptico**: O dispositivo vibra (quando suportado) ao detectar um QR Code com sucesso.

## 🛡️ Pilares de Segurança e Performance

Esta aplicação foi rigorosamente atualizada e protegida contra as seguintes ameaças e gargalos:

### 1. Prevenção de Open Redirect e Phishing
A aplicação **não redireciona automaticamente** os usuários ao detectar uma URL. Em vez disso:
- A câmera é **pausada**.
- A URL identificada é validada e exibida claramente na tela.
- O usuário deve prosseguir clicando no botão explícito **"Acessar Link Seguro"** (ou cancelar a ação), evitando que QR Codes maliciosos abram sites indesejados sem consentimento.

### 2. Validação Nativa de URLs (Prevenção de ReDoS)
Expressões Regulares (Regex) foram substituídas em prol do uso da **API nativa `new URL()`** do JavaScript. Isso confia o parseamento de links diretamente ao motor nativo do navegador (C++), eliminando o risco de instabilidades na UI causadas por injeções de *Regex Denial of Service (ReDoS)* ou tentativas de *bypass* usando links mascarados.

### 3. Gerenciamento Inteligente de Bateria (Background Idle)
O `CameraService` implementa um rastreador da *Page Visibility API* (`visibilitychange`).
Sempre que a aba do navegador perde o foco (o usuário minimizou ou foi para outra aba), a câmera é **desligada imediatamente**. Ao voltar para a aba, a câmera retoma sua atividade original de forma invisível. Isso previne drenagem de bateria e sobrecarga térmica da `GPU/CPU` em celulares, sem interferir na lógica de interface.

### 4. Proteção estrita contra XSS (Cross-Site Scripting)
Todo e qualquer resultado não interpretado lido de um QR Code é injetado no DOM exclusivamente como **Texto Puro** (`textContent`), banindo o uso de propriedades maliciosas como `innerHTML` para vetar a injeção de scripts provenientes de QR Codes modificados para ataques.

### 5. Otimização de Carregamento Event-Driven
Total remoção de rotinas contínuas (Polling via Timeouts). O motor principal (o `main.js`) inicia e instancia seus serviços de forma elegante aguardando a finalização limpa e assíncrona da CDN da biblioteca de câmera por meio do `Event Listener` acoplado ao `onload` do documento HTML.

### 6. Observabilidade e Tratamento de Erros
A inicialização e o rastreamento individual dos quadros (frames) de captura geram *logs* estruturados em formato passível de conversão JSON para o `Console`:
- Falhas assíncronas fatais disparam `console.error` preservando cópias do estado.
- Falhas transientes de hardware/borrão de frame lançam `console.warn` silenciosos, reportando eventos irregulares sem estressar a thread principal do navegador.

## 🏗️ Arquitetura de Código

O JavaScript foi dividido modularmente para garantir *Separation of Concerns*:

```text
src/
├── engines/
│   └── ScannerEngine.js   # Lógica algorítmica: decide oque fazer quando um texto/url é lido.
├── handlers/
│   └── UIHandler.js       # Manipulação isolada do DOM e troca de visibilidade/estados do layout.
├── services/
│   └── CameraService.js   # Wrapper da lib externa, controlando estritamente hardware e bateria.
└── main.js                # Core: Instanciação das classes dependentes de forma invertida.
```

## 🚀 Como Executar Localmente

Como a aplicação depende do acesso ao Hardware (Câmera), navegadores modernos exigem que ela seja executada em um contexto seguro (`https://`) ou via `localhost`.

1. Clone o repositório.
2. Navegue até a pasta usando seu terminal.
3. Inicie um servidor HTTP local simples (Requer Python 3):
   ```bash
   python -m http.server 8000
   ```
4. Acesse `http://localhost:8000/` no navegador de sua preferência.

---
*Construído com tecnologias Web nativas com foco em resiliência e estabilidade corporativa.*
