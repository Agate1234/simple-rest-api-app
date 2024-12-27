import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      }),
    )
    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)

    await prisma.cleadDb()

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close()
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'faizabiyu@gmail.com',
      password: '123'
    }

    describe('Signup', () => {
      it('harus gagal jika password kosong', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      });

      it('harus gagal jika email kosong', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      });

      it('harus gagal jika tidak ada isinya', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      });

      it('harus signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      });
    });

    describe('Signin', () => {

      it('harus gagal jika password kosong', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      });

      it('harus gagal jika email kosong', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      });

      it('harus gagal jika tidak ada isinya', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
      });

      it('harus signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      });
    });
  });

  describe('User', () => {
    describe('Get User', () => {
      it('harus mendapatkan user login', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .expectStatus(200)
      });
    });

    describe('Edit User', () => {
      it('harus bisa edit', () => {
        const dto: EditUserDto = {
          firstName: 'faiz',
          email: 'faizabiyu@gmail.com'
        }
        
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get Empty Bookmarks', () => {
      it('harus mendapatkan bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .expectStatus(200)
          .expectBody([]) 
      });
    });

    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Bookmark Pertama',
        link: 'https://google.com',
      } 

      it('harus membuat bookmarks', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      });
    });

    describe('Get Bookmarks', () => {
      it('harus mendapatkan bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .expectStatus(200)
          .expectJsonLength(1)
      });
    });

    describe('Get Bookmarks By Id', () => {
      it('harus mendapatkan bookmarks by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      });
    });

    describe('Edit Bookmark', () => {
      const dto: EditBookmarkDto = {
        title: 'Perubahan Bookmark Pertama',
        description: 'Deskripsi Bookmark Pertama',
      }

      it('harus bisa edit bookmarks by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
      });
    });

    describe('Delete Bookmark', () => {
      it('harus bisa hapus bookmarks by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .expectStatus(204)
      });
      
      it('harus mendapatkan bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}' 
          })
          .expectStatus(200)
          .expectJsonLength(0)
      });
    });
  });
});