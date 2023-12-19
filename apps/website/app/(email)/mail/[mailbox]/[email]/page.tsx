import { getCurrentUser } from "@/app/utils/user"
import { notFound, redirect } from "next/navigation"
import { getMailbox } from "../tools"
import { Metadata } from "next"
import { prisma } from "@email/db"


const getEmail = async (mailboxId: string, emailId: string, userId: string) => {
    const mailbox = await getMailbox(mailboxId, userId)
    if (!mailbox) return notFound()

    const email = await prisma.email.findUnique({
        where: {
            id: emailId
        }
    })

    return email
}


export async function generateMetadata(props: { params: { mailbox: string, email: string } }): Promise<Metadata> {
    const userId = await getCurrentUser()
    const mail = await getEmail(props.params.mailbox, props.params.email, userId!)
    if (!mail) return notFound()

    return {
        title: mail.subject,
    }
}



export default async function Email({
    params,
}: {
    params: {
        mailbox: string,
        email: string
    }
}) {
    const userId = await getCurrentUser()
    const mail = await getEmail(params.mailbox, params.email, userId!)
    if (!mail) return notFound()


    if (!mail.isRead) await prisma.email.update({
        data: {
            isRead: true
        },
        where: {
            id: mail.id,
        }
    });


    return (
        <div>
            <h1>{mail.subject}</h1>
            <p>{mail.snippet}</p>
        </div>

    )
}