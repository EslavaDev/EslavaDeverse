# EslavaDeverse-mqtt

## `anget/connecte`

``` js
{
    agent:{
        uuid, // auto generar
        username, // definir por configuracion
        name, //definir por configuracion
        hostname, // obtener de sistema operativo
        pid // obtener del proceso
    }
}
```

## `anget/disconnected`

``` js
{
    agent:{
        uuid, // auto generar
    }
}
```

## `agent/message`

``` js
{
    agent,
    metrics:[
        {
            type,
            value
        }
    ],
    timestamp // generar cuando creamos el mensaje
}
```

