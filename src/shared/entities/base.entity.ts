import { BaseEntity, ObjectIdColumn, ObjectId, Column, Index, Entity, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
export abstract class BaseModel extends BaseEntity {
    constructor() {
        super();
    }

    @ObjectIdColumn({ default: () => new ObjectId() }) id: ObjectId;

    @CreateDateColumn() @Index("IDX_CRD") createdAt: Date;

    @UpdateDateColumn() @Index("IDX_MOD") updatedAt: Date;

    @Column() @Index("IDX_CREATEDBY") createdBy: string;

    @Column() updatedBy: string;

    @Column({unique:true}) @Index() key: string;

    @Column({default:true}) @Index() isActive: boolean;
    @Column({default:false}) @Index() isDeleted: boolean;

    @BeforeInsert()
    generateKey() {
      if (!this.key) {
        this.key = uuidv4();
      }
    }

    @BeforeInsert()
    setDefaultValues() {
      if (this.isActive === undefined || this.isActive === null) this.isActive = true;
      if (this.isDeleted === undefined || this.isDeleted === null) this.isDeleted = false;
      if (!this.createdBy) this.createdBy = 'system';
      if (!this.updatedBy) this.updatedBy = 'system';
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
}