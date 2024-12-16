import prisma from './src/infrastructure/database/postgres';
import { StaticRoles } from './src/domain/enums';
import slugify from './src/utils/slugifyString';
import passwordManager from './src/infrastructure/providers/passwordManager';

export async function initSuperAdmin() {
  try {
    let superadmin = await prisma.user.findUnique({
      where: {
        email: 'amahkudi@gmail.com',
      },
      include: {
        roles: true,
      },
    });

    if (superadmin) {
      const superRole = superadmin?.roles?.find(
        (rol) => rol.slug === slugify(StaticRoles.SuperAdmin)
      );

      if (!superRole) {
        const role = await prisma.role.findUnique({
          where: {
            slug: slugify(StaticRoles.SuperAdmin),
          },
        });

        if (role) {
          superadmin = await prisma.user.update({
            where: {
              id: superadmin.id,
            },
            data: {
              roles: {
                connect: {
                  id: role.id,
                },
              },
            },
            include: {
              roles: true,
            },
          });
        } else {
          const superRole = await prisma.role.create({
            data: {
              name: StaticRoles.SuperAdmin,
              slug: slugify(StaticRoles.SuperAdmin),
              createdAt: new Date(),
              updatedAt: new Date(),
              createdById: superadmin.id,
            },
          });

          superadmin = await prisma.user.update({
            where: {
              id: superadmin.id,
            },
            data: {
              roles: {
                connect: {
                  id: superRole.id,
                },
              },
            },
            include: {
              roles: true,
            },
          });
        }
      }

      return superadmin;
    } else {
      superadmin = await prisma.user.create({
        data: {
          email: 'amahkudi@gmail.com',
          password: await passwordManager.encryptPassword('678560446-Hk'),
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'Henson Kudi Amah',
          phone: '+971588629213',
          emailVerified: true,
          phoneVerified: true,
        },
        include: {
          roles: true,
        },
      });

      let role = await prisma.role.findUnique({
        where: {
          slug: slugify(StaticRoles.SuperAdmin),
        },
      });

      if (!role) {
        role = await prisma.role.create({
          data: {
            name: StaticRoles.SuperAdmin,
            slug: slugify(StaticRoles.SuperAdmin),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdById: superadmin.id,
          },
        });
      }

      superadmin = await prisma.user.update({
        where: {
          id: superadmin.id,
        },
        data: {
          roles: {
            connect: {
              id: role.id,
            },
          },
        },
        include: {
          roles: true,
        },
      });

      return superadmin;
    }
  } catch (err) {
    return null;
  }
}
