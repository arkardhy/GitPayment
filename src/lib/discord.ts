import { format } from 'date-fns';
import { formatCurrency } from '../utils/payment';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1313178138909347911/E12o6f7oUqn1O437XzFOo_7pMyE3l9vxj_qsssYfmFOnFjPcY0quHwIeKXztwM5pjLyG';

interface PaymentNotification {
  supervisorName: string;
  supervisorPosition: string;
  employeeName: string;
  employeePosition: string;
  amount: number;
  date: Date;
  daysCount: number;
  isLeave: boolean;
  endDate?: Date;
}

export async function sendPaymentNotification({
  supervisorName,
  supervisorPosition,
  employeeName,
  employeePosition,
  amount,
  date,
  daysCount,
  isLeave,
  endDate
}: PaymentNotification) {
  const dateDisplay = endDate 
    ? `${format(date, 'dd MMMM')} - ${format(endDate, 'dd MMMM yyyy')}`
    : format(date, 'dd MMMM yyyy');

  const message = {
    embeds: [{
      title: isLeave ? '📋 Leave Record Added' : '💰 Payment Record Added',
      color: isLeave ? 0xFFA500 : 0x00FF00,
      fields: [
        {
          name: 'Penanggung Jawab',
          value: `${supervisorName} (${supervisorPosition})`,
          inline: true
        },
        {
          name: 'Penyetor',
          value: `${employeeName} (${employeePosition})`,
          inline: true
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true
        },
        {
          name: 'Tanggal',
          value: dateDisplay,
          inline: true
        },
        {
          name: 'Total Hari',
          value: `${daysCount} hari`,
          inline: true
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true
        }
      ],
      footer: {
        text: `Total ${isLeave ? 'Leave' : 'Payment'}: ${formatCurrency(amount)}`
      },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Failed to send Discord notification');
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}
