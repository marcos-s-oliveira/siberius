# 🚫 Regras de Interface do Usuário - Frontend

## ⚠️ NUNCA USE ALERT, CONFIRM OU PROMPT DO BROWSER!

### ❌ PROIBIDO:

```javascript
// NUNCA FAÇA ISSO:
alert('Mensagem');
confirm('Deseja continuar?');
prompt('Digite algo:');
window.alert();
window.confirm();
window.prompt();
```

### ✅ CORRETO:

Use sempre os componentes modais customizados:

#### 1. AlertModal - Para Alertas e Notificações

```tsx
import AlertModal from './components/AlertModal';

function MyComponent() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });

  const handleSomething = () => {
    setAlertData({
      title: 'Sucesso',
      message: 'Operação realizada com sucesso!',
      type: 'success'
    });
    setShowAlert(true);
  };

  return (
    <>
      {/* Seu conteúdo */}
      
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        buttonText="OK"
      />
    </>
  );
}
```

**Tipos disponíveis:**
- `info` - Ícone ℹ️ azul
- `success` - Ícone ✅ verde
- `warning` - Ícone ⚠️ laranja
- `error` - Ícone ❌ vermelho

#### 2. ConfirmModal - Para Confirmações

```tsx
import ConfirmModal from './components/ConfirmModal';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    // Executar a ação
    await deleteItem(selectedItem);
  };

  return (
    <>
      <button onClick={() => handleDelete(item)}>Deletar</button>
      
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Deseja realmente excluir ${selectedItem?.nome}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmStyle="danger"  // 'primary' | 'danger' | 'warning'
      />
    </>
  );
}
```

#### 3. Modal - Para Conteúdo Customizado

```tsx
import Modal from './components/Modal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Abrir Modal</button>
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Título do Modal"
        size="medium"  // 'small' | 'medium' | 'large'
        showCloseButton={true}
      >
        {/* Seu conteúdo customizado aqui */}
        <div>
          <p>Qualquer conteúdo React pode ir aqui</p>
          <button onClick={() => setShowModal(false)}>Fechar</button>
        </div>
      </Modal>
    </>
  );
}
```

## Por que NÃO usar alert/confirm/prompt?

1. **UX Ruim**: Bloqueiam completamente a página
2. **Não Customizável**: Não podem ser estilizados
3. **Mobile Unfriendly**: Aparência inconsistente em dispositivos móveis
4. **Sem Controle**: Não podem ser testados adequadamente
5. **Acessibilidade**: Problemas com leitores de tela
6. **Fora do Padrão**: Não seguem o design system da aplicação

## Vantagens dos Modais Customizados

✅ Design consistente com a aplicação
✅ Animações suaves
✅ Responsivos e mobile-friendly
✅ Testáveis
✅ Acessíveis
✅ Fecham com ESC
✅ Overlay clicável para fechar
✅ Scroll interno quando necessário
✅ Ícones visuais para melhor comunicação

## Exemplo Completo - TecnicoList.tsx

Veja o arquivo `frontend/src/components/TecnicoList.tsx` para um exemplo completo de uso de:
- AlertModal para erros
- ConfirmModal para deletar e gerar token
- Modal para exibir QR code

## Estilo dos Modais

Os estilos estão em `frontend/src/index.css` com o comentário:
```css
/* Modal Styles - NUNCA USE alert(), confirm() ou prompt() do browser! */
```

## Checklist para Code Review

Ao revisar código, verifique:

- [ ] Não há uso de `alert()`
- [ ] Não há uso de `confirm()`
- [ ] Não há uso de `prompt()`
- [ ] Modais customizados são usados
- [ ] Estados dos modais são gerenciados corretamente
- [ ] Mensagens são claras e úteis
- [ ] Ícones apropriados são usados (success/error/warning)

## Dúvidas?

Consulte os componentes existentes:
- `frontend/src/components/Modal.tsx`
- `frontend/src/components/AlertModal.tsx`
- `frontend/src/components/ConfirmModal.tsx`
- `frontend/src/components/TecnicoList.tsx` (exemplo de uso)
