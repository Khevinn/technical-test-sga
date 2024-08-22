import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'Tutorial', timestamps: true })
export class Tutorial {
  @Prop({ unique: true, required: true })
  title: string;

  @Prop()
  content: string;
}

export const TutorialSchema = SchemaFactory.createForClass(Tutorial);
