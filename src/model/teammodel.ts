import * as sqlite3 from 'sqlite3' ;
import { DataModel, DataRecord, ValueType } from "./datamodel";
import winston from 'winston';
import { BARankings, BATeam } from '../bluealliance/badata';

interface scoutvalue {
    tag: string,
    type: string,
    value: any
} ;

export class TeamDataModel extends DataModel {
    public static readonly TeamTableName: string = 'teams' ;

    public constructor(dbname: string, logger: winston.Logger) {
        super(dbname, logger) ;
    }

    public getColumns() : Promise<string[]> {
        return this.getColumnNames(TeamDataModel.TeamTableName) ;
    }

    public init() : Promise<void> {
        let ret = new Promise<void>((resolve, reject) => {
            super.init()
            .then(() => {
                this.createTableIfNecessary(TeamDataModel.TeamTableName)
                    .then(()=> {
                        resolve() ;
                    })
                    .catch((err) => {
                        reject(err) ;
                    }) ;
            })
            .catch((err) => {
                reject(err) ;
            })
        }) ;

        return ret;
    }

    protected createTableQuery() : string {
        let ret = 'create table ' + TeamDataModel.TeamTableName + ' (' ;
        ret += 'key TEXT';
        ret += ', team_number INTEGER NOT NULL' ;
        ret += ');' ;

        return ret ;
    }

    private convertTeamToRecord(team: BATeam) : DataRecord {
        let dr = new DataRecord() ;

        dr.addfield('key', team.key) ;
        dr.addfield('team_number', team.team_number) ;
        dr.addfield('nickname', team.nickname) ;
        dr.addfield('name', team.name) ;
        dr.addfield('school_name', team.school_name) ;
        dr.addfield('city', team.city) ;
        dr.addfield('state_prov', team.state_prov) ;
        dr.addfield('country', team.country) ;
        dr.addfield('address', team.address) ;
        dr.addfield('postal_code', team.postal_code) ;
        dr.addfield('gmaps_place_id', team.gmaps_place_id) ;
        dr.addfield('gmaps_url', team.gmaps_url) ;
        dr.addfield('lat', team.lat) ;
        dr.addfield('lng', team.lng) ;
        dr.addfield('location_name', team.location_name) ;
        dr.addfield('website', team.website) ;
        dr.addfield('rookie_year', team.rookie_year) ;

        return dr ;
    }

    public processBAData(data: BATeam[]) : Promise<void> {
        let ret = new Promise<void>(async (resolve, reject) => {
            let records: DataRecord[] = [] ;

            for(let one of data) {
                let dr = this.convertTeamToRecord(one) ;
                records.push(dr) ;
            }

            try {
                await this.addColsAndData(TeamDataModel.TeamTableName, ['team_number'], records) ;
                resolve() ;
            }
            catch(err) {
                reject(err) ;
            }
        }) ;

        return ret;        
    }
	
    private convertRankingToRecord(ranking: any) : DataRecord {
        let dr = new DataRecord() ;
        dr.addfield('rank', ranking.rank);
        dr.addfield('wins', ranking.record.wins) ;
        dr.addfield('losses', ranking.record.losses);
        dr.addfield('ties', ranking.record.ties) ;
        dr.addfield('team_key', ranking.team_key) ;
        dr.addfield('team_number', DataModel.extractNumberFromKey(ranking.team_key)) ;
        return dr ;
    }

    public processRankings(rankings: any[]) : Promise<void> {
        let ret = new Promise<void>(async (resolve, reject) => {
            let records : DataRecord[] = [];

            for(let t of rankings) {
                records.push(this.convertRankingToRecord(t)) ;
            }

            try {
                await this.addColsAndData(TeamDataModel.TeamTableName, ['team_number'], records) ;
                resolve() ;
            }
            catch(err) {
                reject(err) ;
            }
        }) ;

        return ret ;
    }    

    private convertScoutDataToRecord(team: any, data:any[]) : DataRecord {
        let dr = new DataRecord() ;
        let teamnumber = -1 ;
        let tstr: string = team as string ;

        if (tstr.startsWith('st-')) {
            teamnumber = +tstr.substring(3) ;
        }

        dr.addfield('team_number', teamnumber) ;

        for(let field of data) {
            dr.addfield(field.tag, field.value) ;
        }
        return dr ;
    }

    public async processScoutingResults(data: any[]) : Promise<number[]> {
        let ret = new Promise<number[]>(async (resolve, reject) => {
            let ret: number[] = [] ;
            let records: DataRecord[] = [] ;
            let index = 0;
            while (index < data.length) {
                let team = data[index++] ;
                let sc = data[index++] ;
                let dr = this.convertScoutDataToRecord(team, sc) ;
                ret.push(dr.value('team_number')! as number);
                records.push(dr) ;
            }
            await this.addColsAndData(TeamDataModel.TeamTableName, ['team_number'], records) ;
            resolve(ret) ;
        }) ;
        return ret ;
    }
}