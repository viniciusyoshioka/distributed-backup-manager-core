# Distributed backup manager core

Este programa é um gerenciador de backups descentralizados/distribuídos. Ele
cria e atualiza cópias de backup de uma pasta da máquina local para outras
máquinas conectadas na mesma rede LAN (_Local Area Network_).

## Requisitos

- Linux

    O programa foi desenvolvido, testado e executado no Linux. Qualquer
    distribuição deve funcionar, mas o Mint e o Kali, nas versões mais
    recentes, foram as distribuições usadas. Não há garantia de compatibilidade
    com outros sistemas operacionais.

- NodeJS

    O programa exige o NodeJS instalado para executar o programa. A versão
    usada foi `20.12.1`.

- Yarn

    O projeto usa o Yarn como gerenciador de dependências. A versão usada foi
    `4.8.0`. É equivalente ao NPM. Para usar o Yarn, execute no Terminal
    `corepack enable`, após instalação do NodeJS. Ao executar qualquer comando
    do Yarn neste projeto, a versão `4.8.0` já deve ser usada automaticamente.

- Máquina virtual (opcional)

    Máquinas virtuais não são obrigatórias, elas são necessárias para teste
    apenas se você não tiver outro computador disponível. O programa foi
    testado com o VirtualBox. Recomenda-se a versão do Kali para máquinas
    virtuais. Ao usar máquina virtual, ela também deve cumprir os requisitos
    acima.

## Instalação

Após cumpridos os requisitos, entre na pasta do código-fonte pelo Terminal.

- Instale as dependências:

    ```sh
    yarn install
    ```

- Depois, transpile o código TypeScript para JavaScript:

    ```sh
    yarn build
    ```

- Crie um arquivo `.env` na raiz do projeto e adicione o seguinte conteúdo:

    ```properties
    STAGE=production
    PORT=4444
    EXECUTION_TIME_DECORATOR_ENABLED=true

    SYNC_SERVER_ROOT_DESTINATION_PATH='/home/<USER>/.config/dbmc/root_destination'
    SYNC_SERVER_DATABASE_PATH='/home/<USER>/.config/dbmc/database.sqlite'
    SYNC_SERVER_JWT_SECRET=''
    SYNC_SERVER_TMP_UPLOADS_PATH='/home/<USER>/.config/dbmc/uploads'
    SYNC_CLIENT_TMP_DOWNLOADS_PATH='/home/<USER>/.config/dbmc/downloads'
    ACCESS_TOKEN=''
    ```

    Substitua `<USER>` pelo nome do usuário da sua máquina. Se não souber qual
    é, use o comando `whoami` no Terminal para descobrir.

    A chave `SYNC_SERVER_JWT_SECRET` deve ser única para cada máquina, portanto
    é necessário criar uma. Como o NodeJS já está instalado, abra uma janela do
    Terminal, e execute o comando `node` para entrar no modo interativo. Aqui,
    execute o seguinte código para gerar um segredo JWT:

    ```js
    require('crypto').randomBytes(64).toString('hex').toUpperCase()
    ```

    Copie a string retornada e cole dentro das aspas da chave
    `SYNC_SERVER_JWT_SECRET` no arquivo `.env`.

    A chave `ACCESS_TOKEN` será preenchida posteriormente.

- Repita esse processo para cada máquina ou máquina virtual que deseja executar
 o programa.

## Execução

O programa tem duas versões, o `sync-client` e o `sync-server`.

### Preparando as máquinas para sincronização

O `sync-server` é um servidor HTTP, executado localmente, que fornece APIs REST
para o `sync-client` executar operações de sincronização de backups. Para
realizar um backup ou uma restauração em uma máquina remota, é necessário que
ela esteja executando o `sync-server` em segundo plano. Para iniciar o
`sync-server`, abra o Terminal na máquina remota e execute:

```sh
yarn sync-server:start:prod
```

Se você deseja que outra máquina na sua rede salve cópias de backup na sua
máquina local, inicie o `sync-server` na máquina local da mesma forma.

### Autenticação

Para sincronizar o backup com uma máquina remota, é necessário que o
`sync-client` esteja autenticado com o `sync-server` da máquina remota.
Para isso, primeiro execute o seguinte comando para se registrar:

```sh
yarn start auth register -n <NOME> -e <EMAIL> -w <SENHA> --machine-address <IP>
```

Substitua os parâmetros:

- `NOME`: O nome do seu usuário na máquina remota;
- `EMAIL`: Um endereço de e-mail que identifique seu usuário unicamente. Não
precisa ser um e-mail existente, pois não será enviado código de verificação.
O e-mail será usado apenas para autenticação do usuário entre as máquinas.
Embora o e-mail não seja validado, ele ainda deve ser válido. Isto é, seguir a
expressão regular de endereços de e-mail;
- `SENHA`: A senha de autenticação do seu usuário para a máquina. Deve ser uma
senha segura (deve conter pelo menos 1 letra minúscula, 1 maiúscula, 1 número,
1 símbolo e ter 8 caracteres de comprimento);
- `IP`: O endereço IP (versão 4 ou 6) da máquina com a qual deseja se
autenticar. O endereço pode ser obtido executando o comando `ifconfig -a` na
máquina que busca se saber o endereço;

**Obs.:** Se precisar da documentação do comando, execute o comando com o
parâmetro `-h`, como nos exemplos a seguir:

```sh
yarn start auth -h
yarn start auth register -h
yarn start auth login -h
```

Depois de registrar seu usuário na máquina, autentique-se com:

```sh
yarn start auth login -e <EMAIL> -w <SENHA> --machine-address <IP>
```

Substitua os parâmetros `EMAIL`, `SENHA` e `IP` com os mesmos valores usados
ao registrar seu usuário.

Após a autenticação, este comando irá exibir no Terminal seu _access token_.
Copie esta string e cole na chave `ACCESS_TOKEN` do arquivo `.env` da sua
máquina.

### Sincronização

Para criar ou atualizar o backup de uma pasta da máquina local para a máquina
remota, execute o comando:

```sh
yarn start sync -s <CAMINHO_ORIGEM> --destination-address <IP>
```

Substitua os parâmetros:

- `CAMINHO_ORIGEM`: O caminho, absoluto ou relativo, presente na máquina local,
para a pasta que deseja criar a cópia do backup. Esta pasta pode conter
qualquer tipo de arquivo e pastas dentro de pastas, recursivamente;
- `IP`: O endereço IP (versão 4 ou 6) da máquina com a qual deseja criar ou
atualizar a cópia do backup. Deve ser o endereço da máquina com a qual está
autenticado;

**Obs.:** As instruções deste arquivo são instruções mais simples para o uso
básico do programa. Para a documentação completa do comando de sincronização,
execute:

```sh
yarn start sync -h
```

Para restaurar o backup de uma máquina remota para a máquina local, execute:

```sh
yarn start sync -o <CAMINHO_DESTINO> --source-address <IP>
```

Substitua os parâmetros:

- `CAMINHO_DESTINO`: Caminho, absoluto ou relativo, para uma pasta presente na
máquina local, onde deseja-se salvar o backup restaurado. Pode ser uma pasta
com uma cópia desatualizada do backup ou uma pasta vazia;
- `IP`: O endereço IP (versão 4 ou 6) da máquina que deseja-se buscar uma
cópia do backup para restaurar a cópia local. Deve ser o endereço da máquina
com a qual está autenticado;
