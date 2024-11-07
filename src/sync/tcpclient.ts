import winston from "winston";
import { Packet } from "./Packet";
import { SyncClient } from "./syncclient";
import * as net from 'net' ;

export class TCPClient extends SyncClient {
    private static portNumber: number = 45455 ;

    private host_ : string ;
    private socket_ : net.Socket ;

    public constructor(logger:winston.Logger, host: string) {
        super(logger) ;

        this.host_ = host ;
        this.socket_ = new net.Socket() ;
    }

    public name() : string {
        return "TCPConnector" ;
    }

    public connect() : Promise<void> {
        let ret = new Promise<void>((resolve, reject) => {

            this.socket_.on('connect', () => {
                this.emit('connected') ;
            }) ;

            this.socket_.on('data', (data) => {
                this.logger_.debug('TCPClient received ' + data.length + ' bytes of data') ;
                this.extractPacket(data) ;
            }) ;

            this.socket_.on('error', (err) => {
                this.emit('error', err) ;
            }) ;

            this.socket_.on('close', () => {
                this.emit('close') ;
            }) ;

            this.socket_.connect(TCPClient.portNumber) ;

            resolve() ;
        }) ;

        return ret ;
    }

    public send(p: Packet) : void {
        let buffer = this.convertToBytes(p) ;
        this.socket_.write(buffer, (err) => {
            if (err) {
                this.logger_.error('error writing data to TCPServer from TCPClient') ;
            }
        }) ;
    }
}