// URL base da API - ajuste conforme necessário
const API_BASE_URL = 'http://localhost:8080/produtos';

// Elementos DOM
const produtoForm = document.getElementById('produto-form');
const produtoIdInput = document.getElementById('produto-id');
const nomeInput = document.getElementById('nome');
const precoInput = document.getElementById('preco');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const produtosList = document.getElementById('produtos-list');
const loadingElement = document.getElementById('loading');
const emptyMessage = document.getElementById('empty-message');
const refreshBtn = document.getElementById('refresh-btn');
const deleteModal = document.getElementById('delete-modal');
const produtoNomeModal = document.getElementById('produto-nome');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const notification = document.getElementById('notification');

// Estado da aplicação
let produtos = [];
let editando = false;
let produtoParaExcluir = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    
    // Event Listeners
    produtoForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelarEdicao);
    refreshBtn.addEventListener('click', carregarProdutos);
    confirmDeleteBtn.addEventListener('click', confirmarExclusao);
    cancelDeleteBtn.addEventListener('click', fecharModal);
});

// Funções da API
async function carregarProdutos() {
    mostrarLoading(true);
    
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }
        
        produtos = await response.json();
        renderizarProdutos();
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao carregar produtos', 'error');
    } finally {
        mostrarLoading(false);
    }
}

async function adicionarProduto(produto) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produto)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao adicionar produto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function atualizarProduto(id, produto) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produto)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar produto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function excluirProduto(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir produto');
        }
        
        return true;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Manipulação do formulário
function handleFormSubmit(event) {
    event.preventDefault();
    
    const produto = {
        nome: nomeInput.value,
        preco: parseFloat(precoInput.value)
    };
    
    if (editando) {
        const id = produtoIdInput.value;
        atualizarProdutoNoServidor(id, produto);
    } else {
        adicionarProdutoNoServidor(produto);
    }
}

async function adicionarProdutoNoServidor(produto) {
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adicionando...';
        
        await adicionarProduto(produto);
        mostrarNotificacao('Produto adicionado com sucesso!', 'success');
        limparFormulario();
        carregarProdutos();
    } catch (error) {
        mostrarNotificacao('Erro ao adicionar produto', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Adicionar Produto';
    }
}

async function atualizarProdutoNoServidor(id, produto) {
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Atualizando...';
        
        await atualizarProduto(id, produto);
        mostrarNotificacao('Produto atualizado com sucesso!', 'success');
        cancelarEdicao();
        carregarProdutos();
    } catch (error) {
        mostrarNotificacao('Erro ao atualizar produto', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Adicionar Produto';
    }
}

function editarProduto(id) {
    const produto = produtos.find(p => p.id === id);
    
    if (produto) {
        produtoIdInput.value = produto.id;
        nomeInput.value = produto.nome;
        precoInput.value = produto.preco;
        
        editando = true;
        formTitle.textContent = 'Editar Produto';
        submitBtn.textContent = 'Atualizar Produto';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll para o formulário
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelarEdicao() {
    editando = false;
    limparFormulario();
    formTitle.textContent = 'Adicionar Novo Produto';
    submitBtn.textContent = 'Adicionar Produto';
    cancelBtn.style.display = 'none';
}

function limparFormulario() {
    produtoForm.reset();
    produtoIdInput.value = '';
}

// Exclusão de produtos
function solicitarExclusao(id, nome) {
    produtoParaExcluir = id;
    produtoNomeModal.textContent = nome;
    deleteModal.style.display = 'flex';
}

async function confirmarExclusao() {
    if (produtoParaExcluir) {
        try {
            await excluirProduto(produtoParaExcluir);
            mostrarNotificacao('Produto excluído com sucesso!', 'success');
            carregarProdutos();
        } catch (error) {
            mostrarNotificacao('Erro ao excluir produto', 'error');
        } finally {
            fecharModal();
        }
    }
}

function fecharModal() {
    deleteModal.style.display = 'none';
    produtoParaExcluir = null;
}

// Renderização
function renderizarProdutos() {
    if (produtos.length === 0) {
        produtosList.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    produtosList.style.display = 'block';
    emptyMessage.style.display = 'none';
    
    produtosList.innerHTML = '';
    
    produtos.forEach(produto => {
        const produtoElement = document.createElement('div');
        produtoElement.className = 'produto-card';
        
        produtoElement.innerHTML = `
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2)}</p>
            </div>
            <div class="produto-actions">
                <button class="btn-edit" onclick="editarProduto(${produto.id})">Editar</button>
                <button class="btn-delete" onclick="solicitarExclusao(${produto.id}, '${produto.nome}')">Excluir</button>
            </div>
        `;
        
        produtosList.appendChild(produtoElement);
    });
}

// Utilitários
function mostrarLoading(mostrar) {
    loadingElement.style.display = mostrar ? 'block' : 'none';
    if (mostrar) {
        produtosList.style.display = 'none';
        emptyMessage.style.display = 'none';
    }
}

function mostrarNotificacao(mensagem, tipo) {
    notification.textContent = mensagem;
    notification.className = `notification ${tipo}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}