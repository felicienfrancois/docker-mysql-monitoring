# docker-mysql-monitoring
Simple nodejs http endpoint to monitor database status

### Configuration environment variables

- `MYSQL_HOST`: mysql server hostname. Default `localhost`
- `MYSQL_PORT`: mysql server port. Default `3306`
- `MYSQL_USER`: mysql user. Default `root`
- `MYSQL_PASSWORD`: mysql password. Default `root`
- `MYSQL_PASSWORD`: mysql password. Default `root`
- `DATABASE_NAME`: selected database name. Default none
- `ENDPOINT`: endpoint uri
- `QUERY`: sql query to execute. Default `SELECT 1 AS UP`
- `SINGLE_LINE`: whereas result should be serialized as list (false) or single object (true). Default `false`
- `FIELDS`: list of fields that should be retained from query result

### Multiple endpoints configuration
- `ENDPOINT_*`: used to define multiple endpoints. Replace `*`by incremental number
- `QUERY_*`:  used to define multiple endpoints. Default to `$QUERY`. Replace `*`by incremental number
- `SINGLE_LINE_*`:  used to define multiple endpoints. Default to `$SINGLE_LINE`. Replace `*`by incremental number
- `FIELDS_*`:  used to define multiple endpoints. Default to `$FIELDS`. Replace `*`by incremental number
- `MYSQL_HOST_*`: mysql server hostname. Default to `$MYSQL_HOST`. Replace `*`by incremental number
- `MYSQL_PORT_*`: mysql server port. Default to `$MYSQL_PORT`. Replace `*`by incremental number
- `MYSQL_USER_*`: mysql user. Default to `$MYSQL_USER`. Replace `*`by incremental number
- `MYSQL_PASSWORD_*`: mysql password. Default to `$MYSQL_PASSWORD`. Replace `*`by incremental number
- `DATABASE_NAME_*`: selected database name. Default to `$DATABASE_NAME`.

# Example docker-compose configuration

```yml
version: "3"
services:

  db-master:
    image: mariadb:latest
    networks:
      - databases
    volumes:
      - /data/db-master:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: myStrongPassword1

  db-slave:
    image: mariadb:latest
    networks:
      - databases
    volumes:
      - /data/db-slave:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: myStrongPassword2

  monitoring:
    image: felicienfrancois/docker-mysql-monitoring
    networks:
      - databases
    ports:
      - 80:80
    environment:
      MYSQL_HOST_1: db-master
      MYSQL_USER_1: root
      MYSQL_PASSWORD_1: myStrongPassword1
      ENDPOINT_1: /monitor-master
      QUERY_1: SHOW MASTER STATUS
      SINGLE_LINE_1: "true"
      MYSQL_HOST_2: db-slave
      MYSQL_USER_2: root
      MYSQL_PASSWORD_2: myStrongPassword2
      ENDPOINT_2: /monitor-slave
      QUERY_2: SHOW SLAVE STATUS
      FIELDS_2: Slave_IO_Running,Slave_SQL_Running
      SINGLE_LINE_2: "true"

networks:
  databases:
```