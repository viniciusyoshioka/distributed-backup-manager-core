
- Permitir apenas máquinas conectadas à rede local/mesma sub rede.
    - Pegar o endereço IP da máquina
    - Pegar a máscara de sub rede
    - Calcular se o IP da máquina está na mesma sub rede do endereço da outra máquina

- Adicionar testes automatizados para todos os arquivos
- Ferramenta para deduplicação de arquivos. Remover arquivos com mesma hash, mas com nome ou caminho diferente
- Ferramenta para comparar se duas pastas estão exatamente iguais
    - Comparar todas as subpastas
        - Nenhuma subpasta pode ter pasta a mais ou a menos
        - A estrutura deve ser igual, mesmo que haja pastas vazias
    - Comparar todos os arquivos
        - Nenhuma subpasta pode ter arquivo a mais ou a menos
        - Todos os arquivos devem ter um arquivo, com a mesma hash, no mesmo caminho da outra pasta

- Adicionar argumento --exception-mode em `Cli`
- Implementar --exception-mode nos syncers
- Testar outros tipos de caminhos como
    - OTHER
    - SYMLINK_FILE
    - SYMLINK_DIR
    - SYMLINK_OTHER
