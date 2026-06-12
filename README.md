# CRUD - Pontos de apoio por conta das chuvas

Desde de 2022 as ocorrências de eventos climáticos extremos vêm se tornando uma realidade frequente em Pernambuco cada vez mais, exigindo que o governo do estado tomasse medidas rápidas e estruturadas para a resolução dos diversos casos de alagamentos e desmoronamentos. Diante do cenário de desalojamento de famílias em decorrência de fortes chuvas, a tecnologia surge como uma ferramenta indispensável para organizar as ações de socorro mútuo. Este projeto tem como proposta apresentar um site capaz de fazer um gerenciamento,  a ponto de abrigo emergências. O que está sendo utilizado para a construção do site é o ambiente de execução Node.Js, operando através do modelo de sistema CRUD (Create, Read, Update, Delete) para centralizar dados cruciais e facilitar a coordenação das equipes de assistência.

## Requisitos
Para baixar e rodar este projeto você precisa de:

- Node.js (versão 24.16.0 ou superior)
- Git (2.40 ou superior) -apenas se haver necessidade de clonar o repositório via terminal
- NPM (gerenciador de pacotes instalado junto com o Node)
   
## Como rodar o Servidor
Caso tenha baixado o arquivo ZIP, extraia-o. Se preferir clonar via GitHub, abra o terminal e digite:

```
git clone <url-do-repositorio>
```
```
cd Sistema-de-cadastramento-em-pontos-de-apoio-por-conta-das-chuvas
```

Instale as dependências necessárias e inicie o servidor:

* npm install
* node index.js

## Para acessar a tela principal
Com o servidor rodando, abra seu navegador e acesse:

- Tela principal: 
```
http://localhost:3000/index.html
```
- Status da API: 
```
http://localhost:3000/api/status
```

## Linguagems Utilizadas
* Javascript (Backend e Frontend)
* HTML5 (Estruturação da tela prrincipal)
* CSS3 (Estilização da Interface)

## Frameworks e Bibliotecas Utilizadas

* Node.js (Ambiente de execução)
* Express (Framework backend para criação de API e rotas)
*  Supabase SDK (Integração com o banco de dados e autenticação)

