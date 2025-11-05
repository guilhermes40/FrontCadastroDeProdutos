package com.segundaAPI.minhaSegundaAPI.Service;

import com.segundaAPI.minhaSegundaAPI.Model.Produto;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ProdutoService {
    private static final List<Produto> produtos = new ArrayList<>();
    private static final AtomicLong counter = new AtomicLong();

    public List<Produto> findAll() {
        return produtos;
    }

    public Optional<Produto> findById(Long id) {
        return produtos.stream().filter(p -> p.getId().equals(id)).findFirst();
    }

    public Produto save(Produto produto) {
        produto.setId(counter.incrementAndGet());
        produtos.add(produto);
        return produto;
    }

    public Optional<Produto> update(Long id, Produto produtoAtualizado) {
        Optional<Produto> produtoExistente = findById(id);
        if (produtoExistente.isPresent()) {
            Produto p = produtoExistente.get();
            p.setNome(produtoAtualizado.getNome());
            p.setPreco(produtoAtualizado.getPreco());
            return Optional.of(p);
        }
        return Optional.empty();
    }

    public boolean deleteById(Long id) {
        return produtos.removeIf(p -> p.getId().equals(id));
    }
}