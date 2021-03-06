import { PrimaryColumn, ManyToOne, Entity, Column, OneToMany } from 'typeorm/browser'
import { MasterKeyEntity, PersonaEntity } from 'src/lib/storage/entities'
import { Type } from 'class-transformer'

@Entity('derived_keys')
export class DerivedKeyEntity {
  @PrimaryColumn({ length: 110 })
  encryptedWif!: string

  @Column()
  path!: string

  @Column()
  keyType!: string

  @OneToMany(type => PersonaEntity, persona => persona.controllingKey)
  personas!: PersonaEntity[]

  @Type(() => MasterKeyEntity)
  @ManyToOne(type => MasterKeyEntity, master => master.derivedKeys, { cascade: true })
  masterKey!: MasterKeyEntity
}
