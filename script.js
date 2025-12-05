class Carrinho {
    constructor() {
        this.itens = this.carregarCarrinho();
        this.atualizarContador();
    }

    carregarCarrinho() {
        const carrinhoSalvo = localStorage.getItem('carrinho');
        return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
    }

    salvarCarrinho() {
        localStorage.setItem('carrinho', JSON.stringify(this.itens));
        this.atualizarContador();
    }

    adicionarProduto(nome, preco, quantidade = 1, imagem = '') {
        const precoNumerico = parseFloat(preco.replace('R$', '').replace(',', '.').trim());
        
        const produtoExistente = this.itens.find(item => item.nome === nome);
        
        if (produtoExistente) {
            produtoExistente.quantidade += quantidade;
        } else {
            this.itens.push({
                nome: nome,
                preco: precoNumerico,
                quantidade: quantidade,
                imagem: imagem
            });
        }
        
        this.salvarCarrinho();
        this.mostrarNotificacao(`${nome} adicionado ao carrinho!`);
    }

    removerProduto(nome) {
        this.itens = this.itens.filter(item => item.nome !== nome);
        this.salvarCarrinho();
        this.mostrarNotificacao('Produto removido do carrinho!');
    }

    atualizarQuantidade(nome, quantidade) {
        const produto = this.itens.find(item => item.nome === nome);
        if (produto) {
            if (quantidade <= 0) {
                this.removerProduto(nome);
            } else {
                produto.quantidade = quantidade;
                this.salvarCarrinho();
            }
        }
    }

    calcularTotal() {
        return this.itens.reduce((total, item) => {
            return total + (item.preco * item.quantidade);
        }, 0);
    }

    getQuantidadeTotal() {
        return this.itens.reduce((total, item) => total + item.quantidade, 0);
    }

    atualizarContador() {
        const contador = this.getQuantidadeTotal();
        const linkCarrinho = document.querySelector('nav a[href*="carrinho"]');
        
        if (linkCarrinho) {
            if (contador > 0) {
                let badge = linkCarrinho.querySelector('.badge-carrinho');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'badge-carrinho';
                    linkCarrinho.appendChild(badge);
                }
                badge.textContent = `(${contador})`;
            } else {
                const badge = linkCarrinho.querySelector('.badge-carrinho');
                if (badge) {
                    badge.remove();
                }
            }
        }
    }

    limparCarrinho() {
        this.itens = [];
        this.salvarCarrinho();
        this.mostrarNotificacao('Carrinho limpo!');
    }

    renderizarCarrinho() {
        const containerCarrinho = document.getElementById('carrinho-itens');
        const totalCarrinho = document.getElementById('total-carrinho');
        
        if (!containerCarrinho) return;

        if (this.itens.length === 0) {
            containerCarrinho.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
            if (totalCarrinho) {
                totalCarrinho.textContent = formatarPreco(0);
            }
            return;
        }

        let html = '';
        this.itens.forEach(item => {
            html += `
                <div class="item-carrinho">
                    ${item.imagem ? `<img src="${item.imagem}" alt="${item.nome}" class="img-carrinho">` : ''}
                    <div class="info-item">
                        <h4>${item.nome}</h4>
                        <p class="preco-item">${formatarPreco(item.preco)}</p>
                    </div>
                    <div class="controles-item">
                        <button class="btn-quantidade" onclick="carrinho.atualizarQuantidade('${item.nome}', ${item.quantidade - 1})">-</button>
                        <span class="quantidade">${item.quantidade}</span>
                        <button class="btn-quantidade" onclick="carrinho.atualizarQuantidade('${item.nome}', ${item.quantidade + 1})">+</button>
                        <button class="btn-remover" onclick="carrinho.removerProduto('${item.nome}'); carrinho.renderizarCarrinho();">Remover</button>
                    </div>
                    <div class="subtotal-item">
                        <strong>${formatarPreco(item.preco * item.quantidade)}</strong>
                    </div>
                </div>
            `;
        });

        containerCarrinho.innerHTML = html;
        
        if (totalCarrinho) {
            totalCarrinho.textContent = formatarPreco(this.calcularTotal());
        }
    }

    mostrarNotificacao(mensagem) {
        const notificacaoAnterior = document.querySelector('.notificacao');
        if (notificacaoAnterior) {
            notificacaoAnterior.remove();
        }

        const notificacao = document.createElement('div');
        notificacao.className = 'notificacao';
        notificacao.textContent = mensagem;
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #D4AC0D;
            color: #1a1a1a;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: bold;
            animation: slideIn 0.3s ease-out;
        `;

        if (!document.querySelector('#notificacao-style')) {
            const style = document.createElement('style');
            style.id = 'notificacao-style';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .badge-carrinho {
                    background-color: #D4AC0D;
                    color: #1a1a1a;
                    border-radius: 50%;
                    padding: 2px 6px;
                    font-size: 0.8em;
                    margin-left: 5px;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notificacao);

        setTimeout(() => {
            notificacao.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notificacao.remove(), 300);
        }, 3000);
    }
}

const carrinho = new Carrinho();

document.addEventListener('DOMContentLoaded', function() {
    inicializarPaginaProdutos();
    inicializarProdutosDestaque();
    inicializarNavegacao();
    inicializarPaginaCarrinho();
    inicializarPaginaContato();
});

function inicializarPaginaProdutos() {
    const produtos = document.querySelectorAll('.lista-de-produtos .produto');
    
    if (produtos.length > 0) {
        produtos.forEach(produto => {
            const botaoAdicionar = produto.querySelector('input[type="submit"][value="Adicionar"]');
            
            if (botaoAdicionar) {
                botaoAdicionar.style.cssText = `
                    background-color: #D4AC0D;
                    color: #1a1a1a;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.3s;
                    margin-top: 10px;
                `;
                
                botaoAdicionar.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#B8860B';
                });
                
                botaoAdicionar.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '#D4AC0D';
                });
                
                botaoAdicionar.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const nomeProduto = produto.querySelector('h3')?.textContent.trim() || 'Produto';
                    const precoProduto = produto.querySelector('.preco')?.textContent.trim() || 'R$ 0,00';
                    const imagemProduto = produto.querySelector('img')?.src || '';
                    
                    carrinho.adicionarProduto(nomeProduto, precoProduto, 1, imagemProduto);
                });
            }
        });
    }
}

function inicializarProdutosDestaque() {
    const produtosDestaque = document.querySelectorAll('.lista-produtos .produto');
    
    if (produtosDestaque.length > 0) {
        produtosDestaque.forEach(produto => {
            const botaoVer = produto.querySelector('.botao-ver');
            if (botaoVer) {
                botaoVer.addEventListener('click', function(e) {
                });
            }

            const botaoAdicionar = document.createElement('button');
            botaoAdicionar.textContent = 'Adicionar ao Carrinho';
            botaoAdicionar.className = 'botao-adicionar';
            botaoAdicionar.style.cssText = `
                background-color: #D4AC0D;
                color: #1a1a1a;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
                font-weight: bold;
                transition: background-color 0.3s;
                width: 100%;
            `;
            
            botaoAdicionar.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#B8860B';
            });
            
            botaoAdicionar.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#D4AC0D';
            });
            
            botaoAdicionar.addEventListener('click', function(e) {
                e.preventDefault();
                const nomeProduto = produto.querySelector('h3')?.textContent.trim() || 'Produto';
                const precoProduto = produto.querySelector('.preco')?.textContent.trim() || 'R$ 0,00';
                const imagemProduto = produto.querySelector('img')?.src || '';
                carrinho.adicionarProduto(nomeProduto, precoProduto, 1, imagemProduto);
            });
            
            produto.appendChild(botaoAdicionar);
        });
    }
}

function inicializarPaginaCarrinho() {
    const paginaCarrinho = document.getElementById('carrinho-itens');
    
    if (paginaCarrinho) {
        carrinho.renderizarCarrinho();
        
        const btnLimpar = document.getElementById('limpar-carrinho');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                    carrinho.limparCarrinho();
                    carrinho.renderizarCarrinho();
                }
            });
        }
        
        const btnFinalizar = document.getElementById('finalizar-compra');
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', function() {
                if (carrinho.itens.length === 0) {
                    alert('Seu carrinho está vazio!');
                    return;
                }
                
                if (confirm(`Finalizar compra no valor de ${formatarPreco(carrinho.calcularTotal())}?`)) {
                    alert('Compra finalizada com sucesso! Obrigado pela preferência.');
                    carrinho.limparCarrinho();
                    carrinho.renderizarCarrinho();
                }
            });
        }
    }
}

function inicializarPaginaContato() {
    const formContato = document.getElementById('form-contato');
    
    if (formContato) {
        formContato.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const mensagem = document.getElementById('mensagem').value.trim();
            
            if (!nome || !email || !mensagem) {
                alert('Por favor, preencha todos os campos!');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um email válido!');
                return;
            }
            
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            formContato.reset();
        });
    }
}

function inicializarNavegacao() {
    const linksNavegacao = document.querySelectorAll('nav a[href^="#"]');
    
    linksNavegacao.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const destino = document.querySelector(href);
                if (destino) {
                    destino.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

function formatarPreco(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

window.carrinho = carrinho;
window.formatarPreco = formatarPreco;
