import { Migration } from '@mikro-orm/migrations';

export class Migration20210122180257 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "category" ("id" varchar(255) not null, "name" varchar(255) not null);');
    this.addSql('alter table "category" add constraint "category_pkey" primary key ("id");');

    this.addSql('create table "subcategory" ("id" varchar(255) not null, "name" varchar(255) not null, "category_id" varchar(255) not null);');
    this.addSql('alter table "subcategory" add constraint "subcategory_pkey" primary key ("id");');

    this.addSql('create table "category_item" ("id" serial primary key, "subcategory_id" varchar(255) not null, "name" varchar(255) not null);');

    this.addSql('create table "user" ("id" varchar(255) not null, "is_admin" bool not null, "email" varchar(255) not null, "is_email_confirmed" bool not null, "name" varchar(255) null, "password" varchar(255) not null, "role" int2 not null, "password_reset_token" varchar(255) null, "password_reset_token_expires_at" timestamptz(0) null, "is_deleted" bool not null, "created_at" timestamptz(0) not null default now, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("id");');

    this.addSql('create table "refresh_token" ("id" serial primary key, "token" varchar(255) not null, "user_id" varchar(255) not null, "expires_at" timestamptz(0) not null, "created_at" timestamptz(0) not null default now);');

    this.addSql('create table "organizer" ("id" varchar(255) not null, "user_id" varchar(255) not null, "is_approved" bool not null);');
    this.addSql('alter table "organizer" add constraint "organizer_pkey" primary key ("id");');
    this.addSql('alter table "organizer" add constraint "organizer_user_id_unique" unique ("user_id");');

    this.addSql('create table "organizer_social_media" ("id" serial primary key, "organizer_id" varchar(255) not null, "name" varchar(255) not null, "link" varchar(255) not null, "icon" varchar(255) not null);');

    this.addSql('create table "organizer_contact_person" ("id" serial primary key, "organizer_id" varchar(255) not null, "name" varchar(255) not null, "email" varchar(255) null, "phone_number" varchar(255) null, "is_public" bool not null);');

    this.addSql('create table "event" ("id" varchar(255) not null, "organizer_id" varchar(255) not null, "name" varchar(255) not null, "is_public" bool not null, "is_approved" bool not null, "start_date" timestamptz(0) null, "end_date" timestamptz(0) null, "image_cover" varchar(255) null, "description" varchar(255) null, "is_deleted" bool not null, "created_at" timestamptz(0) not null default now, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "event" add constraint "event_pkey" primary key ("id");');

    this.addSql('create table "event_competition" ("id" varchar(255) not null, "event_id" varchar(255) not null, "name" varchar(255) not null, "elevation_gain" int4 null, "elevation_gain_unit" int2 null, "elevation_loss" int4 null, "elevation_loss_unit" int2 null, "age_limit_minimum" int4 null, "age_limit_maximum" int4 null, "distance" int4 null, "distance_unit" int2 null);');
    this.addSql('alter table "event_competition" add constraint "event_competition_pkey" primary key ("id");');

    this.addSql('create table "event_competition_price_step" ("id" serial primary key, "competition_id" varchar(255) not null, "price" int4 not null, "currency" int2 not null, "end_time" timestamptz(0) not null);');

    this.addSql('create table "event_document" ("id" serial primary key, "event_id" varchar(255) not null, "name" varchar(255) not null, "file" varchar(255) not null);');

    this.addSql('create table "event_location" ("id" serial primary key, "event_id" varchar(255) not null, "latitude" int4 not null, "longitude" int4 not null, "label" varchar(255) null, "country_code" varchar(255) null, "country_name" varchar(255) null, "state" varchar(255) null, "county" varchar(255) null, "city" varchar(255) null, "postal_code" varchar(255) null, "street" varchar(255) null, "house_number" varchar(255) null);');
    this.addSql('alter table "event_location" add constraint "event_location_event_id_unique" unique ("event_id");');

    this.addSql('create table "event_question" ("id" serial primary key, "event_id" varchar(255) not null, "question" varchar(255) not null, "answer" varchar(255) null);');

    this.addSql('create table "event_schedule_item" ("id" serial primary key, "event_id" varchar(255) not null, "name" varchar(255) not null, "time" timestamptz(0) not null);');

    this.addSql('alter table "subcategory" add constraint "subcategory_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;');

    this.addSql('alter table "category_item" add constraint "category_item_subcategory_id_foreign" foreign key ("subcategory_id") references "subcategory" ("id") on update cascade;');

    this.addSql('alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "organizer" add constraint "organizer_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "organizer_social_media" add constraint "organizer_social_media_organizer_id_foreign" foreign key ("organizer_id") references "organizer" ("id") on update cascade;');

    this.addSql('alter table "organizer_contact_person" add constraint "organizer_contact_person_organizer_id_foreign" foreign key ("organizer_id") references "organizer" ("id") on update cascade;');

    this.addSql('alter table "event" add constraint "event_organizer_id_foreign" foreign key ("organizer_id") references "organizer" ("id") on update cascade;');

    this.addSql('alter table "event_competition" add constraint "event_competition_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;');

    this.addSql('alter table "event_competition_price_step" add constraint "event_competition_price_step_competition_id_foreign" foreign key ("competition_id") references "event_competition" ("id") on update cascade;');

    this.addSql('alter table "event_document" add constraint "event_document_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;');

    this.addSql('alter table "event_location" add constraint "event_location_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;');

    this.addSql('alter table "event_question" add constraint "event_question_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;');

    this.addSql('alter table "event_schedule_item" add constraint "event_schedule_item_event_id_foreign" foreign key ("event_id") references "event" ("id") on update cascade;');
  }

}
